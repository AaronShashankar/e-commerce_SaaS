import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { patchBusiness } from "../../../api/onboarding.js";

const schema = z.object({
  storeName: z.string().trim().min(2, "Store name must be at least 2 characters").max(120),
  businessType: z.string().trim().min(2, "Business type is required").max(100),
  panOrVatNumber: z.string().trim().min(5, "PAN/VAT number is required").max(20),
  businessAddress: z.string().trim().min(5, "Business address must be at least 5 characters").max(300),
});

const inputCls =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Private Limited Company",
  "Non-Governmental Organization",
  "Other",
];

export default function Step2Business({ defaultValues, onSuccess, onBack }) {
  const [form, setForm] = useState({
    storeName: defaultValues?.storeName ?? "",
    businessType: defaultValues?.businessType ?? "",
    panOrVatNumber: defaultValues?.panOrVatNumber ?? "",
    businessAddress: defaultValues?.businessAddress ?? "",
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const mutation = useMutation({
    mutationFn: patchBusiness,
    onSuccess: (profile) => onSuccess(profile),
    onError: (err) => {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) setErrors(apiErrors);
    },
  });

  function submit(e) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Field label="Store / Brand name" error={errors.storeName?.[0]}>
        <input id="s2-storeName" className={inputCls} value={form.storeName} onChange={set("storeName")} placeholder="e.g. Himalayan Crafts" />
      </Field>

      <Field label="Business type" error={errors.businessType?.[0]}>
        <select id="s2-businessType" className={inputCls} value={form.businessType} onChange={set("businessType")}>
          <option value="">Select business type</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field
        label="PAN / VAT number"
        error={errors.panOrVatNumber?.[0]}
        hint="Your business's PAN or VAT registration number"
      >
        <input id="s2-panOrVatNumber" className={inputCls} value={form.panOrVatNumber} onChange={set("panOrVatNumber")} placeholder="e.g. 123456789" />
      </Field>

      <Field label="Business address" error={errors.businessAddress?.[0]}>
        <textarea
          id="s2-businessAddress"
          className={inputCls}
          rows={3}
          value={form.businessAddress}
          onChange={set("businessAddress")}
          placeholder="Full address including district, city"
        />
      </Field>

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
          id="s2-submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {mutation.isPending ? "Saving…" : "Save & continue →"}
        </button>
      </div>
    </form>
  );
}
