import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Analytics from '../pages/Analytics';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    analytics: {
      get: vi.fn(),
    }
  }
}));

describe('Analytics Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (api.analytics.get as any).mockReturnValue(new Promise(() => {}));
    render(<Analytics />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders KPI metrics and Pareto charts when loaded', async () => {
    const mockData = {
      kpi: {
        total_inspected: 14850,
        overall_yield: 98.4,
        total_defects: 238,
        false_rejects: 1.2
      },
      daily_yields: [96, 97, 98, 99],
      pareto: [
        { name: 'Scratch Defect', count: 120, percent: 50.4, color: 'bg-rose-500' },
        { name: 'Dimension Out of Bounds', count: 85, percent: 35.7, color: 'bg-amber-500' }
      ]
    };

    (api.analytics.get as any).mockResolvedValueOnce(mockData);
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Yield & Defect Analytics')).toBeInTheDocument();
      expect(screen.getByText('14,850')).toBeInTheDocument();
      expect(screen.getByText('98.4%')).toBeInTheDocument();
      expect(screen.getByText('238')).toBeInTheDocument();
      expect(screen.getByText('1.2%')).toBeInTheDocument();
    });

    expect(screen.getByText('Scratch Defect')).toBeInTheDocument();
    expect(screen.getByText('120 (50.4%)')).toBeInTheDocument();
    expect(screen.getByText('Dimension Out of Bounds')).toBeInTheDocument();
  });
});

