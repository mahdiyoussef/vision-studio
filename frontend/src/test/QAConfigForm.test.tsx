import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import QAConfigForm from '../components/QAConfigForm';

vi.mock('../services/api', () => ({
  api: {
    projects: {
      getQaConfig: vi.fn().mockResolvedValue([
        { id: '1', name: 'Stator', nominal: '0', upper: '+0', lower: '-0', unit: 'mm', colorCheck: false },
        { id: '2', name: 'Winding', nominal: '0', upper: '+0', lower: '-0', unit: 'mm', colorCheck: false },
        { id: '3', name: 'Scratch Defect', nominal: '0', upper: '+0', lower: '-0', unit: 'mm', colorCheck: false }
      ]),
      updateQaConfig: vi.fn().mockResolvedValue(true)
    }
  }
}));

describe('QAConfigForm Component', () => {
  it('renders tolerance band editor table and items', async () => {
    render(<QAConfigForm projectId='test' />);

    expect(await screen.findByText('Tolerance Band Editor')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Stator')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Winding')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Scratch Defect')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ add class \/ feature/i })).toBeInTheDocument();
  });

  it('renders color validation configurator and preview chip', async () => {
    render(<QAConfigForm projectId='test' />);

    expect(await screen.findByText('Color Validation Configurator')).toBeInTheDocument();
    expect(screen.getByText('Hue Range')).toBeInTheDocument();
    expect(screen.getByText('Saturation Range')).toBeInTheDocument();
    expect(screen.getByText('Value (Brightness) Range')).toBeInTheDocument();
    expect(screen.getByText('Valid Copper Spec')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save qa tolerances/i })).toBeInTheDocument();
  });
});
