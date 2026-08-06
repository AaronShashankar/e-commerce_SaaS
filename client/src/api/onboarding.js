import api from "./http.js";

export const getOnboarding = async () =>
  (await api.get("/seller/onboarding")).data.profile;

export const patchBusiness = async (data) =>
  (await api.patch("/seller/onboarding/business", data)).data.profile;

export const patchKyc = async (formData) =>
  (await api.patch("/seller/onboarding/kyc", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data.profile;

export const patchBank = async (data) =>
  (await api.patch("/seller/onboarding/bank", data)).data.profile;

export const patchStore = async (formData) =>
  (await api.patch("/seller/onboarding/store", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })).data.profile;

export const resubmitOnboarding = async () =>
  (await api.post("/seller/onboarding/resubmit")).data.profile;

/** Build a URL to fetch a protected KYC image */
export const kycImageUrl = (filename) =>
  filename
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/seller/onboarding/kyc-image/${filename.split("/").pop()}`
    : null;
