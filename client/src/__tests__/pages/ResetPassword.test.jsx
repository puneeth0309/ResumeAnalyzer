import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from '../../pages/ResetPassword';

vi.mock('../../api', () => ({ default: { post: vi.fn() } }));

function renderWithToken() {
  return render(
    <MemoryRouter initialEntries={["/reset-password/token123"]}>
      <ResetPassword />
    </MemoryRouter>
  );
}

test('shows password mismatch error', async () => {
  renderWithToken();

  const pw = screen.getByPlaceholderText(/enter new password/i);
  const cpw = screen.getByPlaceholderText(/confirm new password/i);
  fireEvent.change(pw, { target: { value: 'Password123!' } });
  fireEvent.change(cpw, { target: { value: 'Different123!' } });

  const submit = screen.getByRole('button', { name: /reset password/i });
  const form = submit.closest('form');
  fireEvent.submit(form);

  expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
});

test('password toggles work', async () => {
  renderWithToken();
  const pwInput = screen.getByPlaceholderText(/enter new password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});

test('successful reset shows message', async () => {
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { success: true } });

  renderWithToken();

  const pw = screen.getByPlaceholderText(/enter new password/i);
  const cpw = screen.getByPlaceholderText(/confirm new password/i);
  fireEvent.change(pw, { target: { value: 'Password123' } });
  fireEvent.change(cpw, { target: { value: 'Password123' } });

  const submit = screen.getByRole('button', { name: /reset password/i });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Password reset successful!/i)).toBeInTheDocument();
  expect(API.post).toHaveBeenCalled();
});

test('renders static UI elements on reset password page', () => {
  render(
    <MemoryRouter initialEntries={["/reset/abc123"]}>
      <ResetPassword />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
  expect(screen.getByText(/back to/i)).toBeInTheDocument();
  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument();
});

test('shows server error when reset fails', async () => {
  const { default: API } = await import('../../api');
  API.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid token' } } });

  renderWithToken();

  const pw = screen.getByPlaceholderText(/enter new password/i);
  const cpw = screen.getByPlaceholderText(/confirm new password/i);
  fireEvent.change(pw, { target: { value: 'Password123' } });
  fireEvent.change(cpw, { target: { value: 'Password123' } });

  const submit = screen.getByRole('button', { name: /reset password/i });
  const form = submit.closest('form');
  if (form) form.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Invalid token/i)).toBeInTheDocument();
})
