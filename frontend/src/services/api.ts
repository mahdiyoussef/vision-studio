const API_URL = 'http://localhost:5001/api/v1';

let cachedToken: string | null = null;

export const clearAuthCache = () => {
  cachedToken = null;
};

export const loginAdmin = async () => {
  if (cachedToken) return cachedToken;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Failed to login');
    const data = await res.json();
    cachedToken = data.token;
    return data.token;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = await loginAdmin();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
  
  try {
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }
    return res.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Is the backend running?');
    }
    throw err;
  }
};

export const api = {
  projects: {
    list: () => fetchWithAuth('/projects'),
    get: (id: string) => fetchWithAuth(`/projects/${id}`),
    create: (data: any) => fetchWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => fetchWithAuth(`/projects/${id}`, {
      method: 'DELETE'
    }),
    toggleStatus: (id: string) => fetchWithAuth(`/projects/${id}/toggle`, {
      method: 'POST'
    }),
    getQaConfig: (id: string) => fetchWithAuth(`/projects/${id}/qa_config`),
    updateQaConfig: (id: string, data: any) => fetchWithAuth(`/projects/${id}/qa_config`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMeasurements: (id: string) => fetchWithAuth(`/projects/${id}/measurements`),
    updateMeasurements: (id: string, data: any) => fetchWithAuth(`/projects/${id}/measurements`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getFilterNodes: (id: string) => fetchWithAuth(`/projects/${id}/filter_nodes`),
    updateFilterNodes: (id: string, data: any) => fetchWithAuth(`/projects/${id}/filter_nodes`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getCameras: (id: string) => fetchWithAuth(`/projects/${id}/cameras`),
    getCameraParams: (id: string) => fetchWithAuth(`/projects/${id}/cameras/params`),
    updateCameraParams: (id: string, data: any) => fetchWithAuth(`/projects/${id}/cameras/params`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  webrtc: {
    offer: (sdp: string, type: string, projectId?: string, sessionId?: string) => fetchWithAuth('/webrtc/offer', {
      method: 'POST',
      body: JSON.stringify({ sdp, type, project_id: projectId, session_id: sessionId })
    })
  },
  mlops: {
    train: (data: any, projectId: string) => fetchWithAuth(`/mlops/train?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getJob: (jobId: string, projectId: string) => fetchWithAuth(`/mlops/jobs/${jobId}?project_id=${projectId}`),
    deploy: (jobId: string, projectId: string) => fetchWithAuth(`/mlops/deploy/${jobId}?project_id=${projectId}`, {
      method: 'POST'
    }),
    getModels: (projectId: string) => fetchWithAuth(`/mlops/models?project_id=${projectId}`),
    getSettings: (projectId: string) => fetchWithAuth(`/mlops/settings?project_id=${projectId}`),
    updateSettings: (projectId: string, data: any) => fetchWithAuth(`/mlops/settings?project_id=${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  },
  analytics: {
    get: (projectId: string) => fetchWithAuth(`/analytics/?project_id=${projectId}`)
  },
  datasets: {
    pullKaggle: (data: any, projectId: string) => fetchWithAuth(`/datasets/kaggle?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    wrangle: (data: any, projectId: string) => fetchWithAuth(`/datasets/wrangle?project_id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getJob: (jobId: string) => fetchWithAuth(`/datasets/jobs/${jobId}`)
  },
  system: {
    telemetry: () => fetchWithAuth('/system/telemetry')
  }
};

