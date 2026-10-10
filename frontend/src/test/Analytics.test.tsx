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

  it('renders universal CV metrics and class distribution when loaded', async () => {
    const mockData = {
      kpi: {
        total_inferences: 177398,
        avg_confidence: 92.3,
        low_confidence_count: 1898,
        active_learning_synced: 1518
      },
      daily_inferences: [5000, 10000, 15000, 20000],
      class_distribution: [
        { name: 'Person', count: 18191, percent: 45, color: 'bg-emerald-500' },
        { name: 'Vehicle', count: 6395, percent: 26, color: 'bg-blue-500' }
      ]
    };

    (api.analytics.get as any).mockResolvedValueOnce(mockData);
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('Vision Analytics')).toBeInTheDocument();
      expect(screen.getByText('177,398')).toBeInTheDocument();
      expect(screen.getByText('92.3%')).toBeInTheDocument();
      expect(screen.getByText('1,898')).toBeInTheDocument();
      expect(screen.getByText('1,518')).toBeInTheDocument();
    });

    expect(screen.getByText('Person')).toBeInTheDocument();
    expect(screen.getByText('18,191 (45%)')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
  });

  it('handles legacy format gracefully without crashing', async () => {
    const legacyMockData = {
      kpi: {
        total_inspected: 12000,
        overall_yield: 95.5,
        total_defects: 120,
        false_rejects: 50
      },
      daily_yields: [95, 96, 97],
      pareto: [
        { name: 'Legacy Anomaly', count: 120, percent: 100, color: 'bg-red-500' }
      ]
    };

    (api.analytics.get as any).mockResolvedValueOnce(legacyMockData);
    render(<Analytics />);

    await waitFor(() => {
      expect(screen.getByText('12,000')).toBeInTheDocument();
      expect(screen.getByText('95.5%')).toBeInTheDocument();
    });

    expect(screen.getByText('Legacy Anomaly')).toBeInTheDocument();
  });
});
