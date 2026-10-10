import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LiveInspection from '../pages/LiveInspection';
import { api } from '../services/api';
import { ProjectContext } from '../context/ProjectContext';

vi.mock('../services/api', () => ({
  api: {
    webrtc: {
      offer: vi.fn().mockResolvedValue({ sdp: 'remote-sdp', type: 'answer' })
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

describe('LiveInspection Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders inspection monitor controls and shift stats', () => {
    renderWithContext(<LiveInspection />);

    expect(screen.getByText('Live Inspection Monitor')).toBeInTheDocument();
    expect(screen.getByText('Start Inspection')).toBeInTheDocument();
    expect(screen.getByText('Current Shift Stats')).toBeInTheDocument();
    expect(screen.getByText('1,248')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('42ms')).toBeInTheDocument();
  });

  it('starts WebRTC session when clicking Start Inspection', async () => {
    renderWithContext(<LiveInspection />);

    const startBtn = screen.getByRole('button', { name: /start inspection/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(api.webrtc.offer).toHaveBeenCalledWith('mock-sdp', 'offer', 'test-proj', expect.any(String));
      expect(screen.getByText('Stop Inspection')).toBeInTheDocument();
      expect(screen.getByText('Live Feed Active')).toBeInTheDocument();
    });
  });

  it('toggles display overlay filters', () => {
    renderWithContext(<LiveInspection />);

    const defectsFilter = screen.getByRole('button', { name: /defects/i });
    fireEvent.click(defectsFilter);
    expect(defectsFilter).toHaveClass('text-blue-600');

    const measurementsFilter = screen.getByRole('button', { name: /measurements/i });
    fireEvent.click(measurementsFilter);
    expect(measurementsFilter).toHaveClass('text-blue-600');
  });
});



