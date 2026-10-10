import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectsDashboard from '../pages/ProjectsDashboard';

// ── Mock API ─────────────────────────────────────────────────────────────────
vi.mock('../services/api', () => ({
  api: {
    projects: {
      list: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      toggleStatus: vi.fn(),
    },
    analytics: { get: vi.fn() },
    webrtc: { offer: vi.fn() },
    mlops: { train: vi.fn(), getJob: vi.fn(), deploy: vi.fn() },
    datasets: { pullKaggle: vi.fn(), wrangle: vi.fn() },
  },
  loginAdmin: vi.fn(),
  clearAuthCache: vi.fn(),
}));

import { api } from '../services/api';

const renderDashboard = () =>
  render(<BrowserRouter><ProjectsDashboard /></BrowserRouter>);

describe('ProjectsDashboard – Full Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Empty / loading states ────────────────────────────────────────────────
  it('shows a loading spinner on mount', async () => {
    (api.projects.list as any).mockReturnValue(new Promise(() => {})); // never resolves
    renderDashboard();
    expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
  });

  it('shows empty-state CTA when there are no projects', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText(/no projects found/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /create first project/i })).toBeInTheDocument();
  });

  // ── Project list rendering ────────────────────────────────────────────────
  it('renders a list of projects returned by the API', async () => {
    (api.projects.list as any).mockResolvedValue([
      { id: 'p1', name: 'Stator QA Line', description: 'something' },
      { id: 'p2', name: 'Cable Assembly Check', description: '' },
    ]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText('Stator QA Line')).toBeInTheDocument());
    expect(screen.getByText('Cable Assembly Check')).toBeInTheDocument();
  });

  it('shows Paused status pill on each project card', async () => {
    (api.projects.list as any).mockResolvedValue([
      { id: 'p1', name: 'Alpha Project', description: '' },
    ]);
    renderDashboard();
    await waitFor(() => expect(screen.getByText('Paused')).toBeInTheDocument());
  });

  // ── Wizard open / close ───────────────────────────────────────────────────
  it('opens the project-creation wizard when "New Project" is clicked', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    expect(screen.getByText(/create new project/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e\.g\. engine block qa/i)).toBeInTheDocument();
  });

  it('closes the wizard when Cancel is clicked', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.queryByText(/create new project/i)).not.toBeInTheDocument();
  });

  it('closes the wizard when the × button is clicked', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/create new project/i)).not.toBeInTheDocument();
  });

  // ── Wizard form & submission ──────────────────────────────────────────────
  it('populates form fields and calls api.projects.create on submit', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    (api.projects.create as any).mockResolvedValue({ id: 'newp', name: 'My Engine QA' });
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. engine block qa/i), {
      target: { value: 'My Engine QA' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'chignon' } });

    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(api.projects.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'My Engine QA' })
      );
    });
  });

  it('blocks wizard submit when name field is empty (required)', async () => {
    (api.projects.list as any).mockResolvedValue([]);
    renderDashboard();
    await waitFor(() => screen.getByRole('button', { name: /new project/i }));
    fireEvent.click(screen.getByRole('button', { name: /new project/i }));
    const nameInput = screen.getByPlaceholderText(/e\.g\. engine block qa/i) as HTMLInputElement;
    expect(nameInput.required).toBe(true);
  });

  // ── API error handling ────────────────────────────────────────────────────
  it('handles API list errors gracefully (no crash)', async () => {
    (api.projects.list as any).mockRejectedValue(new Error('Network Error'));
    renderDashboard();
    await waitFor(() => expect(screen.queryByText(/loading projects/i)).not.toBeInTheDocument());
    // should still show header
    expect(screen.getByText(/projects dashboard/i)).toBeInTheDocument();
  });
});
