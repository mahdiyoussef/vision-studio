import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MeasurementBuilderForm from '../components/MeasurementBuilderForm';

vi.mock('../services/api', () => ({
  api: {
    projects: {
      getMeasurements: vi.fn().mockResolvedValue([
        { id: 1, type: 'Distance', source: 'stator_center', target: 'outer_edge', expected: '15.0mm' }
      ]),
      updateMeasurements: vi.fn().mockResolvedValue(true)
    }
  }
}));

describe('MeasurementBuilderForm Component', () => {
  it('renders measurement geometric rules table', async () => {
    render(<MeasurementBuilderForm projectId='test' />);

    expect(await screen.findByText('Measurement Geometric Rules')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('stator_center')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('outer_edge')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('15.0mm')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument();
  });

  it('renders alignment constraints and blocker family options', async () => {
    render(<MeasurementBuilderForm projectId='test' />);

    expect(await screen.findByText('Alignment Constraints')).toBeInTheDocument();
    expect(screen.getByText('Blocker Family Configurator')).toBeInTheDocument();
    expect(screen.getByText('Operator Hand')).toBeInTheDocument();
    expect(screen.getByText('Debris / Foreign Material')).toBeInTheDocument();
    expect(screen.getByText('High Contrast Shadows')).toBeInTheDocument();
  });

  it('renders camera calibration and interactive calibrator launch action', async () => {
    render(<MeasurementBuilderForm projectId='test' />);

    expect(await screen.findByText('Camera Calibration')).toBeInTheDocument();
    expect(screen.getByText(/42.5 pixels \/ mm/i)).toBeInTheDocument();
    expect(screen.getByText('Interactive Calibrator')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /launch calibrator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save measurement profile/i })).toBeInTheDocument();
  });
});
