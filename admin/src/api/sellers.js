import api from "./http.js";

export const getSellers = async (status) =>
  (await api.get("/admin/sellers", { params: status ? { status } : {} })).data
    .sellers;
export const approveSeller = (id) => api.patch(`/admin/sellers/${id}/approve`);
export const rejectSeller = ({ id, reason }) =>
  api.patch(`/admin/sellers/${id}/reject`, { reason });
export const deactivateSeller = (id) =>
  api.patch(`/admin/sellers/${id}/deactivate`);
