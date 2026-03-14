import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';

vi.mock('../../api', () => ({ default: { post: vi.fn() } }));

test('validates email on forgot password', async () => {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  const submit = screen.getByRole('button', { name: /send reset link/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
});

test('submits email and shows success message', async () => {
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { success: true } });

  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  const emailInput = screen.getByPlaceholderText(/enter your registered email/i);
  const submit = screen.getByRole('button', { name: /send reset link/i });

  fireEvent.change(emailInput, { target: { value: 'user@user.com' } });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Password reset link sent to your email!/i)).toBeInTheDocument();
  expect(API.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'user@user.com' });
});

test('renders static elements on forgot password page', () => {
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  expect(screen.getByText(/enter your registered email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your registered email/i)).toBeInTheDocument();
  expect(screen.getByText(/back to login/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
});

test('shows server error when forgot password fails', async () => {
  const { default: API } = await import('../../api');
  API.post.mockRejectedValueOnce({ response: { data: { error: 'Email not found' } } });

  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );

  const emailInput = screen.getByPlaceholderText(/enter your registered email/i);
  const submit = screen.getByRole('button', { name: /send reset link/i });
  fireEvent.change(emailInput, { target: { value: 'noone@x.com' } });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Email not found/i)).toBeInTheDocument();
})
