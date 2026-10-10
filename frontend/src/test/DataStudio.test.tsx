import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataStudio from '../pages/DataStudio';
import { api } from '../services/api';
import toast from 'react-hot-toast';

vi.mock('../services/api', () => ({
  api: {
    datasets: {
      pullKaggle: vi.fn(),
      wrangle: vi.fn(),
    }
  }
}));

const { mockToast } = vi.hoisted(() => {
  const fn = vi.fn();
  Object.assign(fn, {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  });
  return { mockToast: fn };
});

vi.mock('react-hot-toast', () => ({
  default: mockToast,
  toast: mockToast,
}));

import { ProjectContext } from '../context/ProjectContext';

const mockContextValue = {
  activeProjectId: 'test-proj',
  setActiveProjectId: vi.fn(),
  projects: [],
  refreshProjects: vi.fn()
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <ProjectContext.Provider value={mockContextValue}>
      {ui}
    </ProjectContext.Provider>
  );
};

describe('DataStudio Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('alerts if Kaggle credentials are missing on Pull Dataset', () => {
    renderWithContext(<DataStudio />);

    const pullBtn = screen.getByRole('button', { name: /pull dataset/i });
    fireEvent.click(pullBtn);

    expect(toast).toHaveBeenCalledWith(
      expect.stringContaining('Please configure your Kaggle credentials')
    );
  });

  it('pulls dataset successfully when credentials exist in localStorage', async () => {
    localStorage.setItem('kaggleUsername', 'testuser');
    localStorage.setItem('kaggleKey', 'testkey123');

    (api.datasets.pullKaggle as any).mockResolvedValueOnce({
      path: '/tmp/datasets/car-plates',
      schema: { columns: ['image_path', 'xmin', 'ymin', 'xmax', 'ymax', 'class_label'] }
    });

    renderWithContext(<DataStudio />);

    const pullBtn = screen.getByRole('button', { name: /pull dataset/i });
    fireEvent.click(pullBtn);

    await waitFor(() => {
      expect(api.datasets.pullKaggle).toHaveBeenCalledWith({
        slug: 'andrewmvd/car-plate-detection',
        credentials: { username: 'testuser', key: 'testkey123' }
      }, 'test-proj');
      expect(screen.getByText(/4,332 images/i)).toBeInTheDocument();
    });
  });

  it('allows updating train/val/test split partition', () => {
    renderWithContext(<DataStudio />);

    expect(screen.getByText('Train: 70%')).toBeInTheDocument();
    expect(screen.getByText('Val: 20%')).toBeInTheDocument();
    expect(screen.getByText('Test: 10%')).toBeInTheDocument();
  });
});

