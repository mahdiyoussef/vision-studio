import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrainingStudio from '../pages/TrainingStudio';
import { api } from '../services/api';
import { ProjectContext } from '../context/ProjectContext';

vi.mock('../services/api', () => ({
  api: {
    mlops: {
      train: vi.fn(),
      getJob: vi.fn(),
    }
  }
}));

const mockContextValue = {
  projects: [],
  activeProjectId: 'test-proj',
  setActiveProjectId: vi.fn(),
  refreshProjects: vi.fn()
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <ProjectContext.Provider value={mockContextValue}>
      {ui}
    </ProjectContext.Provider>
  );
};

describe('TrainingStudio Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders training configuration hyperparameters and compute target selection', () => {
    renderWithContext(<TrainingStudio />);

    expect(screen.getByText('Model Training Studio')).toBeInTheDocument();
    expect(screen.getByText('Training Hyperparameters')).toBeInTheDocument();
    expect(screen.getByText('Hardware Allocation')).toBeInTheDocument();
    expect(screen.getByText(/Local GPU \/ Accelerator/i)).toBeInTheDocument();
    expect(screen.getByText(/Local CPU Fallback/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start training run/i })).toBeInTheDocument();
  });

  it('triggers training run and displays progress and console output', async () => {
    (api.mlops.train as any).mockResolvedValueOnce({ job_id: 'job_456' });
    (api.mlops.getJob as any).mockResolvedValue({
      progress: 50,
      metrics: { loss: 0.24, mAP: 0.88 },
      status: 'running'
    });

    renderWithContext(<TrainingStudio />);

    const startBtn = screen.getByRole('button', { name: /start training run/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(api.mlops.train).toHaveBeenCalledWith({
        model_type: 'yolo',
        epochs: 100,
        compute_target: 'local'
      }, 'test-proj');
      expect(screen.getByText(/Starting training job job_456/i)).toBeInTheDocument();
    });
  });
});

