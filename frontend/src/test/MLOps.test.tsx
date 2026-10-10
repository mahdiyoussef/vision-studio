import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MLOps from '../pages/MLOps';

vi.mock('../services/api', () => ({
  api: {
    mlops: {
      getModels: vi.fn().mockResolvedValue([
        { id: '1', name: 'stator_yolov8_best.pt', architecture: 'YOLOv8s', size: '22MB', status: 'Active' },
        { id: '2', name: 'chignon_unet_v1.onnx', architecture: 'UNet', size: '18MB', status: 'Standby' },
        { id: '3', name: 'resnet50_defects.pt', architecture: 'ResNet50', size: '90MB', status: 'Archived' }
      ]),
      getSettings: vi.fn().mockResolvedValue({
        confidenceThreshold: 0.75,
        nmsIouThreshold: 0.45,
        uncertaintyThreshold: 0.60,
        activeLearningEnabled: true
      }),
      updateSettings: vi.fn().mockResolvedValue(true),
      deploy: vi.fn().mockResolvedValue(true)
    }
  }
}));

const renderMLOps = () => {
  return render(
    <BrowserRouter>
      <MLOps />
    </BrowserRouter>
  );
};

describe('MLOps Page', () => {
  it('renders model registry with registered weights', async () => {
    renderMLOps();

    expect(await screen.findByText('Machine Learning & MLOps')).toBeInTheDocument();
    expect(screen.getByText('Model Registry')).toBeInTheDocument();
    expect(await screen.findByText('stator_yolov8_best.pt')).toBeInTheDocument();
    expect(screen.getByText('chignon_unet_v1.onnx')).toBeInTheDocument();
    expect(screen.getByText('resnet50_defects.pt')).toBeInTheDocument();
  });

  it('renders inference parameters controls', async () => {
    renderMLOps();

    expect(await screen.findByText('Inference Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Confidence Threshold')).toBeInTheDocument();
    expect(screen.getByText('NMS IoU Threshold')).toBeInTheDocument();
  });

  it('renders and toggles active learning queue', async () => {
    renderMLOps();

    expect(await screen.findByText('Local Active Learning')).toBeInTheDocument();
    expect(screen.getByText(/145 frames/i)).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /toggle active learning/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByText('Uncertainty Threshold')).toBeInTheDocument();
  });
});
