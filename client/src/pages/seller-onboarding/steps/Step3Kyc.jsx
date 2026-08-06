import { useRef, useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { patchKyc } from "../../../api/onboarding.js";

const MAX_SIZE = 3 * 1024 * 1024;

const textSchema = z
  .object({
    kycType: z.enum(["citizenship", "nid"], { required_error: "KYC type is required" }),
    kycNumber: z.string().trim().min(1, "KYC number is required"),
  })
  .superRefine(({ kycType, kycNumber }, ctx) => {
    if (kycType === "citizenship" && !/^[a-zA-Z0-9\-]{5,20}$/.test(kycNumber)) {
      ctx.addIssue({ code: "custom", path: ["kycNumber"], message: "Citizenship number must be 5–20 alphanumeric characters (hyphens allowed)" });
    }
    if (kycType === "nid" && !/^\d{10}$/.test(kycNumber)) {
      ctx.addIssue({ code: "custom", path: ["kycNumber"], message: "NID must be exactly 10 digits" });
    }
  });

function validateImageFile(file) {
  if (!file.type.startsWith("image/")) return "Only image files are allowed";
  if (file.size > MAX_SIZE) return "File must be under 3MB";
  return null;
}

function ImageInput({ id, label, onChange, preview, error }) {
  const ref = useRef(null);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className={`relative flex h-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
          preview ? "border-indigo-300 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-400"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <span className="text-2xl">📷</span>
            <p className="mt-1 text-xs text-slate-500">Click to upload</p>
            <p className="text-[10px] text-slate-400">Images only, max 3MB</p>
          </div>
        )}
      </div>
      <input ref={ref} id={id} type="file" accept="image/*" className="hidden" onChange={onChange} />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Step3Kyc({ defaultValues, onSuccess, onBack }) {
  const [form, setForm] = useState({
    kycType: defaultValues?.kycType ?? "",
    kycNumber: defaultValues?.kycNumber ?? "",
  });
  const [files, setFiles] = useState({ kycFrontImage: null, kycBackImage: null, selfieImage: null });
  const [previews, setPreviews] = useState({ kycFrontImage: null, kycBackImage: null, selfieImage: null });
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
    mutationFn: patchKyc,
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
    if (!files.kycFrontImage) newFileErrors.kycFrontImage = "Front image is required";
    if (!files.kycBackImage) newFileErrors.kycBackImage = "Back image is required";
    if (!files.selfieImage) newFileErrors.selfieImage = "Selfie image is required";
    if (Object.keys(newFileErrors).length) {
      setFileErrors(newFileErrors);
      return;
    }

    setErrors({});
    setFileErrors({});

    const fd = new FormData();
    fd.append("kycType", parsed.data.kycType);
    fd.append("kycNumber", parsed.data.kycNumber);
    fd.append("kycFrontImage", files.kycFrontImage);
    fd.append("kycBackImage", files.kycBackImage);
    fd.append("selfieImage", files.selfieImage);
    mutation.mutate(fd);
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">ID document type</label>
        <div className="flex gap-4">
          {[["citizenship", "Citizenship Certificate"], ["nid", "National ID (NID)"]].map(([val, label]) => (
            <label key={val} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm hover:border-indigo-400 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
              <input id={`s3-kycType-${val}`} type="radio" name="kycType" value={val} checked={form.kycType === val} onChange={set("kycType")} className="text-indigo-600" />
              {label}
            </label>
          ))}
        </div>
        {errors.kycType?.[0] && <p className="mt-1 text-xs text-red-600">{errors.kycType[0]}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {form.kycType === "nid" ? "NID number (10 digits)" : "Citizenship number"}
        </label>
        <input
          id="s3-kycNumber"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={form.kycNumber}
          onChange={set("kycNumber")}
          placeholder={form.kycType === "nid" ? "1234567890" : "12-34-56-78901"}
        />
        {errors.kycNumber?.[0] && <p className="mt-1 text-xs text-red-600">{errors.kycNumber[0]}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ImageInput id="s3-kycFrontImage" label="Front side" onChange={handleFileChange("kycFrontImage")} preview={previews.kycFrontImage} error={fileErrors.kycFrontImage} />
        <ImageInput id="s3-kycBackImage" label="Back side" onChange={handleFileChange("kycBackImage")} preview={previews.kycBackImage} error={fileErrors.kycBackImage} />
        <ImageInput id="s3-selfieImage" label="Selfie with ID" onChange={handleFileChange("selfieImage")} preview={previews.selfieImage} error={fileErrors.selfieImage} />
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
          id="s3-submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {mutation.isPending ? "Uploading…" : "Save & continue →"}
        </button>
      </div>
    </form>
  );
}
