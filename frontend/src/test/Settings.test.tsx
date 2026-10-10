import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../pages/Settings';

describe('Settings Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders hardware telemetry and system health status', () => {
    render(<Settings />);

    expect(screen.getByText('System Settings & Hardware')).toBeInTheDocument();
    expect(screen.getByText('Hardware Telemetry')).toBeInTheDocument();
    expect(screen.getByText('System Healthy')).toBeInTheDocument();
    expect(screen.getByText('CPU Load')).toBeInTheDocument();
    expect(screen.getByText('GPU VRAM')).toBeInTheDocument();
    expect(screen.getByText('Disk Storage')).toBeInTheDocument();
  });

  it('saves Kaggle credentials to localStorage', () => {
    render(<Settings />);

    const usernameInput = screen.getByPlaceholderText(/e\.g\. johndoe/i);
    const keyInput = screen.getByPlaceholderText(/••••••••••••/i);

    fireEvent.change(usernameInput, { target: { value: 'metrology_user' } });
    fireEvent.change(keyInput, { target: { value: 'secret_kaggle_token' } });

    const saveBtn = screen.getByRole('button', { name: /save kaggle credentials/i });
    fireEvent.click(saveBtn);

    expect(localStorage.getItem('kaggleUsername')).toBe('metrology_user');
    expect(localStorage.getItem('kaggleKey')).toBe('secret_kaggle_token');
    expect(window.alert).toHaveBeenCalledWith('Kaggle credentials saved!');
  });

  it('renders backup export and import buttons', () => {
    render(<Settings />);

    expect(screen.getByText('Configuration Backup')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export config\.yaml/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload config\.yaml/i })).toBeInTheDocument();
  });
});

