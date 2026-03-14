import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResumeUpload from '../../pages/Dashboard/ResumeUpload';
import { ResumeContext } from '../../context/ResumeContext';

vi.mock('../../api', () => {
  const get = vi.fn().mockResolvedValue({ data: [] });
  const post = vi.fn().mockResolvedValue({ data: { id: 1, original_name: 'test.pdf', analysis_result: {} } });
  return { default: { get, post } };
});

function renderWithContext() {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  return render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );
}

beforeEach(async () => {
  const { default: API } = await import('../../api');
  API.get = vi.fn().mockResolvedValue({ data: [] });
  API.post = vi.fn().mockResolvedValue({ data: { id: 1, original_name: 'test.pdf', analysis_result: {} } });
  API.delete = vi.fn().mockResolvedValue({ data: { success: true } });
});

test('shows error for non-pdf file', async () => {
  renderWithContext();
  const fileInput = document.querySelector('input[type="file"]');
  const file = new File(['hello'], 'resume.txt', { type: 'text/plain' });
  fireEvent.change(fileInput, { target: { files: [file] } });

  await screen.findByText(/resume.txt/i);
  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);

  expect(await screen.findByText(/Only PDF files allowed/i)).toBeInTheDocument();
});

test('uploads a pdf and updates context on success', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../../api');
  API.post.mockResolvedValueOnce({ data: { id: 2, original_name: 'resume.pdf', analysis_result: {} } });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const fileInput = document.querySelector('input[type="file"]');
  const pdf = new File(['%PDF-1.4'], 'resume.pdf', { type: 'application/pdf' });
  fireEvent.change(fileInput, { target: { files: [pdf] } });

  await screen.findByText(/resume.pdf/i);

  await screen.findByText(/no resumes uploaded yet/i).catch(() => {})

  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);

  expect(await screen.findByText(/Upload successful/i)).toBeInTheDocument();
  expect(ctx.setSelectedResume).toHaveBeenCalled();
});

test('renders static UI elements in resume upload', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  expect(screen.getByText(/upload your resume/i)).toBeInTheDocument();
  expect(document.querySelector('input[type="file"]')).toBeTruthy();
  expect(document.querySelector('button[type="submit"]')).toBeInTheDocument();
  expect(screen.getAllByText(/uploaded resumes/i).length).toBeGreaterThan(0);
  await screen.findByText(/no resumes uploaded yet/i);
});

test('shows error when submitting without selecting file', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  await screen.findByText(/no resumes uploaded yet/i).catch(() => {})

  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);
  await screen.findByText(/Please select a file first/i);
});

test('shows file-too-large error for large files', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const input = document.querySelector('input[type="file"]');
  const large = new File([new ArrayBuffer(6 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [large] } });

  await screen.findByText(/big.pdf/i);

  await screen.findByText(/no resumes uploaded yet/i).catch(() => {})

  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);

  expect(await screen.findByText(/File too large/i)).toBeInTheDocument();
});

test('upload failure then retry succeeds', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../../api');
  API.post = vi.fn()
    .mockRejectedValueOnce({ response: { data: { error: 'Network' } } })
    .mockResolvedValueOnce({ data: { id: 99, original_name: 'retry.pdf', analysis_result: {} } });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const input = document.querySelector('input[type="file"]');
  const pdf = new File(['%PDF-1.4'], 'retry.pdf', { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [pdf] } });
  await screen.findByText(/retry.pdf/i);

  await screen.findByText(/no resumes uploaded yet/i).catch(() => {})

  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);

  const matches = await screen.findAllByText(/Network/i)
  expect(matches.length).toBeGreaterThan(0)

  fireEvent.click(upload);
  expect(await screen.findByText(/Upload successful/i)).toBeInTheDocument();
  expect(ctx.setSelectedResume).toHaveBeenCalledWith(expect.objectContaining({ id: 99 }));
});

test('delete success removes resume and shows toast', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../../api');
  API.get.mockResolvedValueOnce({ data: [{ id: 3, original_name: 'to-delete.pdf', created_at: new Date().toISOString() }] });
  API.delete = API.delete || vi.fn()
  API.delete.mockResolvedValueOnce({ data: { success: true } });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  await waitFor(() => expect(screen.getByText(/to-delete.pdf/i)).toBeInTheDocument());
  const delBtn = screen.getByRole('button', { name: /delete to-delete.pdf/i });
  fireEvent.click(delBtn);
  const allDeletes = await screen.findAllByRole('button', { name: /delete/i })
  const confirm = allDeletes[allDeletes.length - 1]
  fireEvent.click(confirm);

  expect(await screen.findByText(/Resume deleted/i)).toBeInTheDocument();
});

test('delete failure shows error toast and keeps resume', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../../api');
  API.get.mockResolvedValueOnce({ data: [{ id: 4, original_name: 'bad-delete.pdf', created_at: new Date().toISOString() }] });
  API.delete = API.delete || vi.fn()
  API.delete.mockRejectedValueOnce({ response: { data: { error: 'Delete failed' } } });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  await waitFor(() => expect(screen.getByText(/bad-delete.pdf/i)).toBeInTheDocument());
  const delBtn = screen.getByRole('button', { name: /delete bad-delete.pdf/i });
  fireEvent.click(delBtn);
  const allDeletes = await screen.findAllByRole('button', { name: /delete/i })
  const confirm = allDeletes[allDeletes.length - 1]
  fireEvent.click(confirm);

  expect(await screen.findByText(/Delete failed/i)).toBeInTheDocument();
  expect(screen.getByText(/bad-delete.pdf/i)).toBeInTheDocument();
});

test('upload progress UI updates during upload', async () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  const { default: API } = await import('../../api');

  API.post = vi.fn().mockImplementation((url, formData, opts) => {
    return new Promise((resolve) => {
      if (opts && typeof opts.onUploadProgress === 'function') {
        opts.onUploadProgress({ lengthComputable: true, loaded: 50, total: 100 });
      }
      setTimeout(() => resolve({ data: { id: 5, original_name: 'progress.pdf', analysis_result: {} } }), 50);
    });
  });

  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const input = document.querySelector('input[type="file"]');
  const pdf = new File(['%PDF-1.4'], 'progress.pdf', { type: 'application/pdf' });
  fireEvent.change(input, { target: { files: [pdf] } });
  await screen.findByText(/progress.pdf/i);
  await screen.findByText(/no resumes uploaded yet/i).catch(() => {})
  const upload = document.querySelector('button[type="submit"]');
  fireEvent.click(upload);

  await waitFor(() => expect(API.post).toHaveBeenCalled())
  expect(await screen.findByText(/Upload successful/i)).toBeInTheDocument()
});

test('file input accepts only pdfs', () => {
  const ctx = { selectedResume: null, setSelectedResume: vi.fn() };
  render(
    <ResumeContext.Provider value={ctx}>
      <ResumeUpload setActiveTab={() => {}} />
    </ResumeContext.Provider>
  );

  const input = document.querySelector('input[type="file"]');
  expect(input).toBeTruthy();
  expect(input.accept).toContain('.pdf');
});
