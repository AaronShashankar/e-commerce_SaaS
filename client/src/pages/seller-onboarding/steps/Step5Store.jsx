import { useRef, useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { patchStore } from "../../../api/onboarding.js";

const MAX_SIZE = 3 * 1024 * 1024;

const textSchema = z.object({
  storeDescription: z
    .string()
    .trim()
    .min(10, "Store description must be at least 10 characters")
    .max(1000),
  pickupLocation: z
    .string()
    .trim()
    .min(3, "Pickup location is required")
    .max(300),
});

function validateImageFile(file) {
  if (!file.type.startsWith("image/")) return "Only image files are allowed";
  if (file.size > MAX_SIZE) return "File must be under 3MB";
  return null;
}

function ImageInput({ id, label, hint, onChange, preview, error }) {
  const ref = useRef(null);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {hint && <p className="mb-1 text-xs text-slate-400">{hint}</p>}
      <div
        onClick={() => ref.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          preview ? "border-indigo-300 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400"
        }`}
        style={{ height: id.includes("Banner") ? "120px" : "100px" }}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-2xl">{id.includes("Banner") ? "🖼️" : "🏪"}</span>
            <p className="mt-1 text-xs text-slate-500">Click to upload</p>
          </div>
        )}
      </div>
      <input ref={ref} id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Step5Store({ defaultValues, onSuccess, onBack, isResubmit }) {
  const [form, setForm] = useState({
    storeDescription: defaultValues?.storeDescription ?? "",
    pickupLocation: defaultValues?.pickupLocation ?? "",
  });
  const [files, setFiles] = useState({ storeLogo: null, storeBanner: null });
  const [previews, setPreviews] = useState({
    storeLogo: defaultValues?.storeLogoUrl ?? null,
    storeBanner: defaultValues?.storeBannerUrl ?? null,
  });
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function handleFileChange(field) {
    return (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const err = validateImageFile(file);
      setFileErrors((prev) => ({ ...prev, [field]: err }));
      if (!err) {
        setFiles((prev) => ({ ...prev, [field]: file }));
        setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
      }
    };
  }

  const mutation = useMutation({
    mutationFn: patchStore,
    onSuccess: (profile) => onSuccess(profile),
    onError: (err) => {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    },
  });

  function submit(e) {
    e.preventDefault();

    const parsed = textSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    const newFileErrors = {};
    if (!files.storeLogo && !previews.storeLogo) newFileErrors.storeLogo = "Store logo is required";
    if (!files.storeBanner && !previews.storeBanner) newFileErrors.storeBanner = "Store banner is required";
    if (Object.keys(newFileErrors).length) {
      setFileErrors(newFileErrors);
      return;
    }

    setErrors({});
    setFileErrors({});

    const fd = new FormData();
    fd.append("storeDescription", parsed.data.storeDescription);
    fd.append("pickupLocation", parsed.data.pickupLocation);
    if (files.storeLogo) fd.append("storeLogo", files.storeLogo);
    if (files.storeBanner) fd.append("storeBanner", files.storeBanner);
    mutation.mutate(fd);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
        🎉 <strong>Final step!</strong> Set up your store profile — this is what buyers will see.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ImageInput
          id="s5-storeLogo"
          label="Store logo"
          hint="Square image, 1:1 ratio recommended"
          onChange={handleFileChange("storeLogo")}
          preview={previews.storeLogo}
          error={fileErrors.storeLogo}
        />
        <ImageInput
          id="s5-storeBanner"
          label="Store banner"
          hint="Wide image, 16:9 ratio recommended"
          onChange={handleFileChange("storeBanner")}
          preview={previews.storeBanner}
          error={fileErrors.storeBanner}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Store description</label>
        <textarea
          id="s5-storeDescription"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={4}
          value={form.storeDescription}
          onChange={set("storeDescription")}
          placeholder="Tell buyers about your store, what you sell, and what makes you unique…"
        />
        {errors.storeDescription?.[0] && (
          <p className="mt-1 text-xs text-red-600">{errors.storeDescription[0]}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Pickup / dispatch location</label>
        <input
          id="s5-pickupLocation"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={form.pickupLocation}
          onChange={set("pickupLocation")}
          placeholder="e.g. Thamel, Kathmandu"
        />
        {errors.pickupLocation?.[0] && (
          <p className="mt-1 text-xs text-red-600">{errors.pickupLocation[0]}</p>
        )}
      </div>

      {mutation.isError && !Object.keys(errors).length && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {mutation.error?.response?.data?.message || "Failed to save. Please try again."}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onBack} className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          ← Back
        </button>
        <button
          id="s5-submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
        >
          {mutation.isPending
            ? "Submitting…"
            : isResubmit
            ? "Update & Resubmit →"
            : "Submit Application →"}
        </button>
      </div>
    </form>
  );
}
