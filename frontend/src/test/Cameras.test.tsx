import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Cameras from '../pages/Cameras';

vi.mock('../services/api', () => ({
  api: {
    projects: {
      getCameras: vi.fn().mockResolvedValue([
        { id: 'cam-01', name: 'MindVision MV-100', protocol: 'usb', status: 'online' },
        { id: 'cam-02', name: 'Logitech C920', protocol: 'usb', status: 'offline' },
        { id: 'cam-03', name: 'Factory RTSP Stream', protocol: 'rtsp', status: 'online' }
      ]),
      getCameraParams: vi.fn().mockResolvedValue({
        exposureTime: 1200,
        sensorGain: 2.5,
        digitalContrast: 50,
        whiteBalanceRed: 1.2
      }),
      updateCameraParams: vi.fn().mockResolvedValue(true)
    }
  }
}));

describe('Cameras Page', () => {
  it('renders discovered cameras and hardware telemetry', async () => {
    render(<Cameras />);

    expect(await screen.findByText('Camera & Hardware Management')).toBeInTheDocument();
    expect((await screen.findAllByText('MindVision MV-100')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Logitech C920')).toBeInTheDocument();
    expect(screen.getByText('Factory RTSP Stream')).toBeInTheDocument();

    expect(screen.getByText('Active Sensor Stats')).toBeInTheDocument();
    expect(screen.getByText('30.0 fps')).toBeInTheDocument();
    expect(screen.getByText('1920x1080')).toBeInTheDocument();
  });

  it('selects camera and updates active view', async () => {
    render(<Cameras />);

    const logitechCameraCards = await screen.findAllByText('Logitech C920');
    fireEvent.click(logitechCameraCards[0]);

    // When clicked, the view will update with the selected camera name
    expect(screen.getAllByText('Logitech C920').length).toBeGreaterThanOrEqual(2);
  });

  it('renders hardware parameter tuning sliders and calibration actions', async () => {
    render(<Cameras />);

    expect(await screen.findByText('Hardware Parameter Tuning')).toBeInTheDocument();
    expect(screen.getByText('Exposure Time')).toBeInTheDocument();
    expect(screen.getByText('Sensor Gain')).toBeInTheDocument();
    expect(screen.getByText('Digital Contrast')).toBeInTheDocument();
    expect(screen.getByText('White Balance (Red)')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /save parameters/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto focus/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /auto exposure/i })).toBeInTheDocument();
  });
});
