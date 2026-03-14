import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

export default function JobMatchGraph({ jobs = [] }) {
  const data = jobs.map(job => ({
    job: job.title,
    score: job.match_score
  }))

  return (
    <div style={{ height: 300 }}>
      <ResponsiveBar
        data={data}
        keys={['score']}
        indexBy="job"
        margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
        padding={0.3}
        layout="vertical"
        colors={{ scheme: 'greens' }}
        borderRadius={4}
        axisBottom={{ tickRotation: -45 }}
        axisLeft={{ tickSize: 5 }}
        animate={true}
      />
    </div>
  )
}
