import api from "./http.js";

export const getNotifications = async (page = 1) =>
  (await api.get("/notifications", { params: { page } })).data;

export const markNotificationRead = async (id) =>
  (await api.patch(`/notifications/${id}/read`)).data;

export const markAllNotificationsRead = async () =>
  (await api.patch("/notifications/read-all")).data;
