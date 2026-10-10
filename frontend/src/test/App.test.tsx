import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AppWrapper from '../App';

// Mock API calls made by initial pages
vi.mock('../services/api', () => ({
  api: {
    projects: {
      list: vi.fn().mockResolvedValue([]),
      get: vi.fn().mockResolvedValue({ id: '1', name: 'Test' }),
      create: vi.fn().mockResolvedValue({ id: '2', name: 'Created' })
    },
    analytics: {
      get: vi.fn().mockResolvedValue({
        kpi: { total_inspected: 1000, overall_yield: 98, total_defects: 20, false_rejects: 2 },
        daily_yields: [95, 98],
        pareto: []
      })
    }
  }
}));

describe('App Component and Shell Navigation', () => {
  it('renders the VisionStudio brand header and Edge badge in sidebar', () => {
    render(<AppWrapper />);
    expect(screen.getByText('VisionStudio')).toBeInTheDocument();
    expect(screen.getByText('Edge')).toBeInTheDocument();
    expect(screen.getByText('Metrology & Inspection')).toBeInTheDocument();
  });

  it('renders all 9 primary navigation links', () => {
    render(<AppWrapper />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Data Studio')).toBeInTheDocument();
    expect(screen.getByText('Live Inspection')).toBeInTheDocument();
    expect(screen.getByText('Filters & Pre-proc')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Cameras')).toBeInTheDocument();
    expect(screen.getByText('MLOps')).toBeInTheDocument();
    expect(screen.getByText('Training Studio')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders the Edge System online status indicator in sidebar footer', () => {
    render(<AppWrapper />);
    expect(screen.getByText('Edge System')).toBeInTheDocument();
    expect(screen.getByText('Local compute ready')).toBeInTheDocument();
  });
});

