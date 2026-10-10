import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, loginAdmin, clearAuthCache } from '../services/api';

describe('Frontend API Client Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearAuthCache();
  });

  it('authenticates and caches the JWT token', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'mock-jwt-token-123' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'p1', name: 'Project 1' }]
      });

    // @ts-ignore
    global.fetch = mockFetch;

    const projects = await api.projects.list();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/v1/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    }));

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:5001/api/v1/projects', expect.objectContaining({
      headers: expect.objectContaining({
        'Authorization': 'Bearer mock-jwt-token-123'
      })
    }));

    expect(projects).toEqual([{ id: 'p1', name: 'Project 1' }]);
  });

  it('handles API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error'
    });

    // @ts-ignore
    global.fetch = mockFetch;

    await expect(loginAdmin()).rejects.toThrow('Failed to login');
  });
});
