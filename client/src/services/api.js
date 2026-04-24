import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Public endpoints
export const getNominees = () => api.get("/nominees");
export const getDeadline = () => api.get("/deadline");
export const checkVoteStatus = (email) =>
  api.get(`/vote/status?email=${encodeURIComponent(email)}`);
export const requestOtp = (email) => api.post("/otp/request", { email });
export const verifyOtp = (email, otp) =>
  api.post("/otp/verify", { email, otp });
export const castVote = (nomineeId, token) =>
  api.post(
    "/vote",
    { nomineeId },
    { headers: { Authorization: `Bearer ${token}` } },
  );

// Admin endpoints
export const adminLogin = (username, password) =>
  api.post("/admin/login", { username, password });

export const getResults = (token) =>
  api.get("/admin/results", { headers: { Authorization: `Bearer ${token}` } });

export const getVoters = (token) =>
  api.get("/admin/voters", { headers: { Authorization: `Bearer ${token}` } });

export const addNominee = (data, token) =>
  api.post("/admin/nominees", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateNominee = (id, data, token) =>
  api.put(`/admin/nominees/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const deleteNominee = (id, token) =>
  api.delete(`/admin/nominees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const exportVotes = (token) =>
  api.get("/admin/export", {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });

export const setDeadline = (deadline, token) =>
  api.put(
    "/admin/deadline",
    { deadline },
    { headers: { Authorization: `Bearer ${token}` } },
  );

export default api;
