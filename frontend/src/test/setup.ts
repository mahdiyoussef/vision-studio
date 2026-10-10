import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock WebRTC RTCPeerConnection for jsdom environment
class MockRTCPeerConnection {
  addTransceiver = vi.fn();
  ontrack = null;
  createOffer = vi.fn().mockResolvedValue({ sdp: 'mock-sdp', type: 'offer' });
  setLocalDescription = vi.fn().mockResolvedValue(undefined);
  setRemoteDescription = vi.fn().mockResolvedValue(undefined);
  localDescription = { sdp: 'mock-sdp', type: 'offer' };
  close = vi.fn();
}

// @ts-ignore
global.RTCPeerConnection = MockRTCPeerConnection;
// @ts-ignore
global.RTCSessionDescription = vi.fn();

