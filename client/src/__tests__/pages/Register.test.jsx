import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../../pages/Register';

vi.mock('../../api', () => ({ default: { post: vi.fn() } }));

test('renders register form and shows validation errors', async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const submit = screen.getByRole('button', { name: /register/i });
  const nameInput = screen.getByPlaceholderText(/enter your name/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/create a password/i);

  fireEvent.change(nameInput, { target: { value: 'ab' } }); 
  fireEvent.change(emailInput, { target: { value: 'invalid' } });
  fireEvent.change(pwInput, { target: { value: '123' } });

  const formEl = submit.closest('form');
  if (formEl) formEl.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Password must/i)).toBeInTheDocument();
});

test('password toggle works', async () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const pwInput = screen.getByPlaceholderText(/create a password/i);
  const toggle = screen.getByRole('button', { name: /show password/i });
  expect(pwInput).toHaveAttribute('type', 'password');
  fireEvent.click(toggle);
  expect(pwInput).toHaveAttribute('type', 'text');
});

test('submits valid form and shows success message', async () => {
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { success: true } });

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const nameInput = screen.getByPlaceholderText(/enter your name/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/create a password/i);
  const submit = screen.getByRole('button', { name: /register/i });

  fireEvent.change(nameInput, { target: { value: 'Alice User' } });
  fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
  fireEvent.change(pwInput, { target: { value: 'Password123' } });

  const formEl = submit.closest('form');
  if (formEl) formEl.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Registration successful!/i)).toBeInTheDocument();
  expect(API.post).toHaveBeenCalledWith('/auth/register', {
    name: 'Alice User',
    email: 'alice@example.com',
    password: 'Password123'
  });
});

test('renders all static UI elements', () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  expect(screen.getByText(/create your account/i)).toBeInTheDocument();
  expect(screen.getByText(/ai resume evaluator/i)).toBeInTheDocument();
  expect(screen.getByText(/full name/i)).toBeInTheDocument();
  expect(screen.getByText(/email/i)).toBeInTheDocument();
  expect(screen.getByText(/password/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/create a password/i)).toBeInTheDocument();
  expect(screen.getByText(/min\s*8/i)).toBeInTheDocument();
  expect(screen.getByText(/letters/i)).toBeInTheDocument();
  expect(screen.getByText(/numbers/i)).toBeInTheDocument();
  expect(screen.getByText(/login here/i)).toBeInTheDocument();
});

test('shows server error message on registration failure', async () => {
  const { default: API } = await import('../../api');
  API.post.mockRejectedValueOnce({ response: { data: { error: 'Email already used' } } });

  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

  const nameInput = screen.getByPlaceholderText(/enter your name/i);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  const pwInput = screen.getByPlaceholderText(/create a password/i);
  const submit = screen.getByRole('button', { name: /register/i });

  fireEvent.change(nameInput, { target: { value: 'Bob' } });
  fireEvent.change(emailInput, { target: { value: 'bob@used.com' } });
  fireEvent.change(pwInput, { target: { value: 'Password123' } });
  const formEl = submit.closest('form');
  if (formEl) formEl.noValidate = true;
  fireEvent.click(submit);

  expect(await screen.findByText(/Email already used/i)).toBeInTheDocument();
})

test('form inputs have required attribute', () => {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )

  const nameInput = screen.getByPlaceholderText(/enter your name/i)
  const emailInput = screen.getByPlaceholderText(/enter your email/i)
  const pwInput = screen.getByPlaceholderText(/create a password/i)

  expect(nameInput).toHaveAttribute('required')
  expect(emailInput).toHaveAttribute('required')
  expect(pwInput).toHaveAttribute('required')
})
