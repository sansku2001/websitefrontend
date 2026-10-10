async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.detail || result.error || 'The request could not be completed.');
  return result;
}

export const api = {
  content: () => request('/api/content'),
  session: () => request('/api/session'),
  login: (username, password) => request('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/api/logout', { method: 'POST' }),
  saveContent: (content) => request('/api/content', { method: 'PUT', body: JSON.stringify(content) }),
  submitComplaint: (data) => request('/api/complaints', { method: 'POST', body: JSON.stringify(data) }),
  complaints: () => request('/api/complaints'),
  updateComplaint: (id, status) => request(`/api/complaints/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  importComplaints: (complaints) => request('/api/complaints/import', { method: 'POST', body: JSON.stringify({ complaints }) }),
  upload: (file) => {
    const body = new FormData();
    body.append('file', file);
    return request('/api/upload', { method: 'POST', body });
  },
};
