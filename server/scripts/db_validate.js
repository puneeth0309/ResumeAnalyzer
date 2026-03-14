import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const requiredTables = ['users', 'resumes', 'jobs', 'matches'];
const expectedForeignKeys = [
  { table: 'resumes', column: 'user_id', references: { table: 'users', column: 'id' } },
  { table: 'matches', column: 'resume_id', references: { table: 'resumes', column: 'id' } },
  { table: 'matches', column: 'job_id', references: { table: 'jobs', column: 'id' } },
];
const recommendedIndexes = [
  { table: 'resumes', column: 'user_id' },
  { table: 'resumes', column: 'created_at' },
  { table: 'matches', column: 'resume_id' },
  { table: 'matches', column: 'match_score' },
];

async function tableExists(table) {
  const res = await pool.query(
    `SELECT to_regclass($1) as exists`,
    [table]
  );
  return res.rows[0].exists !== null;
}

async function foreignKeyExists({ table, column, references }) {
  const res = await pool.query(
    `SELECT tc.constraint_name
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu
       ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu
       ON ccu.constraint_name = tc.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_name = $1
       AND kcu.column_name = $2
       AND ccu.table_name = $3
       AND ccu.column_name = $4
    `,
    [table, column, references.table, references.column]
  );
  return res.rows.length > 0;
}

async function indexExists(table, column) {
  const res = await pool.query(
    `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = $1`,
    [table]
  );
  return res.rows.some(r => r.indexdef.includes(`(${column})`) || r.indexdef.includes(`${column}`));
}

async function checkExplain(queryText, params = []) {
  try {
    const res = await pool.query('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + queryText, params);
    const plan = res.rows[0]['QUERY PLAN'][0];
    return plan;
  } catch (err) {
    return { error: err.message };
  }
}

function findSeqScanNodes(planNode) {
  const nodes = [];
  function walk(node) {
    if (!node) return;
    if (node['Node Type'] && (node['Node Type'] === 'Seq Scan' || node['Node Type'] === 'Gather' && node['Plans'] && node['Plans'].some(p => p['Node Type'] === 'Seq Scan'))) {
      nodes.push(node);
    }
    if (node.Plans && Array.isArray(node.Plans)) {
      node.Plans.forEach(walk);
    }
  }
  walk(planNode.Plan || planNode[0]?.Plan || planNode);
  return nodes;
}

async function main() {
  let ok = true;
  console.log('Checking required tables...');
  for (const t of requiredTables) {
    const exists = await tableExists(t);
    console.log(` - ${t}: ${exists ? 'FOUND' : 'MISSING'}`);
    if (!exists) ok = false;
  }

  console.log('\nChecking foreign keys...');
  for (const fk of expectedForeignKeys) {
    const exists = await foreignKeyExists(fk);
    console.log(` - ${fk.table}.${fk.column} -> ${fk.references.table}.${fk.references.column}: ${exists ? 'OK' : 'MISSING'}`);
    if (!exists) ok = false;
  }

  console.log('\nChecking recommended indexes...');
  for (const idx of recommendedIndexes) {
    const exists = await indexExists(idx.table, idx.column);
    console.log(` - ${idx.table}(${idx.column}): ${exists ? 'index found' : 'no index found (recommended)'}`);
    if (!exists) ok = false;
  }

  console.log('\nRunning EXPLAIN ANALYZE on key queries (sample param = 1)...');
  const checks = [
    { name: 'resumes by id', q: 'SELECT id, original_name, file_url FROM resumes WHERE id = $1', params: [1] },
    { name: 'matches by resume_id join jobs', q: `SELECT m.job_id, m.match_score, m.reasoning, j.title FROM matches m JOIN jobs j ON m.job_id = j.id WHERE m.resume_id = $1 ORDER BY m.match_score DESC`, params: [1] },
    { name: 'jobs full', q: 'SELECT id, title, description, skills_required FROM jobs', params: [] }
  ];

  for (const c of checks) {
    console.log(`\n - ${c.name}`);
    const plan = await checkExplain(c.q, c.params);
    if (plan.error) {
      console.error('   EXPLAIN failed:', plan.error);
      ok = false;
      continue;
    }
    const totalTime = plan[0]?.['Execution Time'] ?? plan['Execution Time'] ?? null;
    console.log('   Execution info (top-level):', JSON.stringify(plan[0]?.Plan?.['Node Type'] || plan[0]?.Plan?.['Plan'], null, 2));
    const seqScans = findSeqScanNodes(plan[0]);
    if (seqScans.length > 0) {
      console.warn('   Warning: sequential scans detected in plan (consider adding indexes):', seqScans.map(n => n['Node Type'] || n['Node Type']));
      ok = false;
    } else {
      console.log('   No Seq Scans detected at top-level.');
    }
  }

  await pool.end();
  if (!ok) {
    console.error('\nDatabase validation FAILED. See warnings above.');
    process.exit(2);
  }
  console.log('\nDatabase validation PASSED.');
  process.exit(0);
}

main().catch(err => {
  console.error('Validation script error:', err);
  process.exit(3);
});
