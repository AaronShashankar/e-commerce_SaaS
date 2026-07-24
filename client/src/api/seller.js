import api from "./http.js";
export const getMySellerProfile = async () => (await api.get("/seller/me")).data.seller;
