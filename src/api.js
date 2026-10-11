const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "" : "https://websitebackend-h797.onrender.com")
).replace(/\/+$/, "");

function buildUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(result.detail)
      ? result.detail.map((item) => item.msg).join(" ")
      : result.detail;
    throw new Error(
      detail || result.error || "The request could not be completed.",
    );
  }
  return result;
}

export const api = {
  assetUrl: (path) => (path?.startsWith("/") ? `${API_BASE_URL}${path}` : path),
  content: () => request("/api/content"),
  session: () => request("/api/session"),
  login: (username, password) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request("/api/logout", { method: "POST" }),
  saveContent: (content) =>
    request("/api/content", { method: "PUT", body: JSON.stringify(content) }),
  submitComplaint: (data) =>
    request("/api/complaints", { method: "POST", body: JSON.stringify(data) }),
  complaints: () => request("/api/complaints"),
  updateComplaint: (id, status) =>
    request(`/api/complaints/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  importComplaints: (complaints) =>
    request("/api/complaints/import", {
      method: "POST",
      body: JSON.stringify({ complaints }),
    }),
  tracker: (limit = 15) => request(`/updates?limit=${Math.min(limit, 15)}`),
  verifyTrackerKey: (key) =>
    request("/updates/admin/verify", {
      method: "POST",
      headers: key ? { "X-Admin-Key": key } : {},
    }),
  createTrackerUpdate: (data, key) =>
    request("/updates", {
      method: "POST",
      body: JSON.stringify(data),
      headers: key ? { "X-Admin-Key": key } : {},
    }),
  editTrackerUpdate: (id, data, key) =>
    request(`/updates/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: key ? { "X-Admin-Key": key } : {},
    }),
  deleteTrackerUpdate: (id, key) =>
    request(`/updates/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: key ? { "X-Admin-Key": key } : {},
    }),
  saveTrackerSummary: (data, key) =>
    request("/summary", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: key ? { "X-Admin-Key": key } : {},
    }),
  uploadTrackerFile: (file, key) => {
    const body = new FormData();
    body.append("file", file);
    return request("/updates/upload", {
      method: "POST",
      body,
      headers: key ? { "X-Admin-Key": key } : {},
    });
  },
  upload: (file) => {
    const body = new FormData();
    body.append("file", file);
    return request("/api/upload", { method: "POST", body });
  },
};
