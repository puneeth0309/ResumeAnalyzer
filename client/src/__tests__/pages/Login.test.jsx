import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthContext } from '../../context/AuthContext';

vi.mock('../../api', () => ({ default: { post: vi.fn() } }));

test('shows email validation and password toggle on login', async () => {
  const setUser = vi.fn();
  render(
  <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  const submit = screen.getByRole('button', { name: /login/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();

  const pwInput = screen.getByPlaceholderText(/enter your password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});

test('shows server error on failed login', async () => {
  const { default: API } = await import('../../api');
  API.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } });

  const setUser = vi.fn();
  render(
  <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/enter your password/i);
  const submit = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: 'bad@example.com' } });
  fireEvent.change(pwInput, { target: { value: 'badpassword' } });

  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
});

test('successful login calls setUser', async () => {
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { user: { name: 'Sam', email: 'sam@x.com' }, token: 'tok' } });

  const setUser = vi.fn();
  render(
  <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/enter your password/i);
  const submit = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: 'sam@x.com' } });
  fireEvent.change(pwInput, { target: { value: 'goodpass' } });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  await waitFor(() => expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam' })));
})

test('renders all static UI elements on login page', () => {
  const setUser = vi.fn();
  render(
    <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  expect(screen.getByText(/ai resume evaluator/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
  expect(screen.getByText(/register here/i)).toBeInTheDocument();
});

test('successful login stores token in localStorage', async () => {
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { user: { name: 'Sam', email: 'sam@x.com' }, token: 'tok-123' } });

  const setUser = vi.fn();
  const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');

  render(
    <AuthContext.Provider value={{ setUser }}>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/enter your password/i);
  const submit = screen.getByRole('button', { name: /login/i });

  fireEvent.change(emailInput, { target: { value: 'sam@x.com' } });
  fireEvent.change(pwInput, { target: { value: 'goodpass' } });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  await waitFor(() => expect(setUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Sam' })));
  expect(setItemSpy).toHaveBeenCalledWith('token', 'tok-123');
  setItemSpy.mockRestore();
});
