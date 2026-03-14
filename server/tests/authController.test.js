import { jest } from '@jest/globals';

let register, login, forgotPassword, resetPassword;

beforeAll(async () => {
  await jest.unstable_mockModule('../src/models/userModel.js', () => ({
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    updateUserPassword: jest.fn()
  }));

  await jest.unstable_mockModule('bcrypt', () => ({
    default: {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn().mockResolvedValue(true)
    }
  }));

  await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
      sign: jest.fn().mockReturnValue('signed-token'),
      verify: jest.fn((token) => ({ userId: 1 }))
    }
  }));

  await jest.unstable_mockModule('../src/utils/mail.js', () => ({
    sendResetPasswordEmail: jest.fn().mockResolvedValue(true)
  }));

  const mod = await import('../src/controllers/authController.js');
  register = mod.register;
  login = mod.login;
  forgotPassword = mod.forgotPassword;
  resetPassword = mod.resetPassword;
});

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('authController.register', () => {
  test('returns 400 if missing fields', async () => {
    const req = { body: { name: '', email: '', password: '' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 409 if email already used', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, email: 'used@used.com' });

    const req = { body: { name: 'used', email: 'used@used.com', password: 'password123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('creates user on success', async () => {
    const { getUserByEmail, createUser } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue(null);
    createUser.mockResolvedValue({ id: 2, name: 'create', email: 'create@create.com' });

    const req = { body: { name: 'create', email: 'create@create.com', password: 'password123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object) }));
  });
});

describe('authController.login', () => {
  test('returns 400 if missing fields', async () => {
    const req = { body: { email: '', password: '' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 401 when user not found', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue(null);
    const req = { body: { email: 'notfound@notfound.com', password: 'password123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns 401 when password invalid', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, password_hash: 'hash', name: 'hash', email: 'hash@hash.com', role: 'user' });
    const bcrypt = await import('bcrypt');
    bcrypt.default.compare.mockResolvedValue(false);

    const req = { body: { email: 'hash@hash.com', password: 'wrongpassword123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('returns token on success', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, password_hash: 'hash', name: 'hash', email: 'hash@hash.com', role: 'user' });
    const bcrypt = await import('bcrypt');
    bcrypt.default.compare.mockResolvedValue(true);
    const req = { body: { email: 'hash@hash.com', password: 'rightpassword123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ user: expect.any(Object), token: expect.any(String) }));
  });
});

describe('authController.error paths', () => {
  test('register handles createUser throwing an error', async () => {
    const { getUserByEmail, createUser } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue(null);
    createUser.mockRejectedValueOnce(new Error('db fail'));
    const mod = await import('../src/controllers/authController.js');
    const req = { body: { name: 'x', email: 'x@x.com', password: 'p' } };
    const res = mockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await mod.register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('login handles bcrypt.compare throwing error', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, password_hash: 'hash' });
    const bcrypt = await import('bcrypt');
    bcrypt.default.compare.mockRejectedValueOnce(new Error('bcrypt fail'));
    const mod = await import('../src/controllers/authController.js');
    const req = { body: { email: 'x@x.com', password: 'p' } };
    const res = mockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await mod.login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
  
  test('forgotPassword handles email send failure', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, email: 'fail@send.com', name: 'Fail' });
    const mail = await import('../src/utils/mail.js');
    mail.sendResetPasswordEmail.mockRejectedValueOnce(new Error('smtp fail'));

    const mod = await import('../src/controllers/authController.js');
    const req = { body: { email: 'fail@send.com' } };
    const res = mockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await mod.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('resetPassword handles updateUserPassword throwing error', async () => {
    const jwt = await import('jsonwebtoken');
    jwt.default.verify = () => ({ userId: 1 });
    const { updateUserPassword } = await import('../src/models/userModel.js');
    updateUserPassword.mockRejectedValueOnce(new Error('db fail'));

    const mod = await import('../src/controllers/authController.js');
    const req = { params: { token: 't' }, body: { password: 'newpass' } };
    const res = mockRes();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await mod.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('authController.forgotPassword', () => {
  test('returns 400 if missing email', async () => {
    const req = { body: {} };
    const res = mockRes();
    await forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 if user not found', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue(null);
    const req = { body: { email: 'notfound@notfound.com' } };
    const res = mockRes();
    await forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('sends reset email on success', async () => {
    const { getUserByEmail } = await import('../src/models/userModel.js');
    getUserByEmail.mockResolvedValue({ id: 1, email: 'reset@reset.com', name: 'reset' });
    const req = { body: { email: 'reset@reset.com' } };
    const res = mockRes();
    await forgotPassword(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

describe('authController.resetPassword', () => {
  test('returns 400 if token missing', async () => {
    const req = { params: {}, body: { password: 'newpassword123' } };
    const res = mockRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 if password missing', async () => {
    const req = { params: { token: 't' }, body: {} };
    const res = mockRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 400 if token invalid', async () => {
    const jwt = await import('jsonwebtoken');
    jwt.default.verify = () => { throw new Error('invalid'); };
    const req = { params: { token: 'bad' }, body: { password: 'newpassword123' } };
    const res = mockRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('returns 404 if user not found when updating password', async () => {
    const jwt2 = await import('jsonwebtoken');
    jwt2.default.verify = () => ({ userId: 999 });
    const { updateUserPassword } = await import('../src/models/userModel.js');
    updateUserPassword.mockResolvedValue(null);
    const req = { params: { token: 't' }, body: { password: 'newpassword123' } };
    const res = mockRes();
    await resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('resets password successfully', async () => {
    const jwt3 = await import('jsonwebtoken');
    jwt3.default.verify = () => ({ userId: 1 });
    const { updateUserPassword } = await import('../src/models/userModel.js');
    updateUserPassword.mockResolvedValue({ id: 1 });
    const req = { params: { token: 't' }, body: { password: 'newpassword123' } };
    const res = mockRes();
    await resetPassword(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

afterAll(() => {
  jest.resetModules();
  jest.restoreAllMocks();
});
