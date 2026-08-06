import { useState } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { patchBank } from "../../../api/onboarding.js";

const schema = z.object({
  bankName: z.string().trim().min(2, "Bank name is required").max(100),
  accountHolderName: z.string().trim().min(2, "Account holder name is required").max(120),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,20}$/, "Account number must be 8–20 digits"),
  branchName: z.string().trim().min(2, "Branch name is required").max(100),
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

const NEPAL_BANKS = [
  "Nepal Bank Limited",
  "Rastriya Banijya Bank",
  "Agricultural Development Bank",
  "Nabil Bank",
  "Nepal Investment Bank",
  "Standard Chartered Bank Nepal",
  "Himalayan Bank",
  "Nepal SBI Bank",
  "Everest Bank",
  "Citizens Bank International",
  "Prime Commercial Bank",
  "Sunrise Bank",
  "Global IME Bank",
  "NMB Bank",
  "Prabhu Bank",
  "Kumari Bank",
  "Century Commercial Bank",
  "Other",
];

export default function Step4Bank({ defaultValues, onSuccess, onBack }) {
  const [form, setForm] = useState({
    bankName: defaultValues?.bankName ?? "",
    accountHolderName: defaultValues?.accountHolderName ?? "",
    accountNumber: defaultValues?.accountNumber ?? "",
    branchName: defaultValues?.branchName ?? "",
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const mutation = useMutation({
    mutationFn: patchBank,
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
      <Field label="Bank name" error={errors.bankName?.[0]}>
        <select id="s4-bankName" className={inputCls} value={form.bankName} onChange={set("bankName")}>
          <option value="">Select your bank</option>
          {NEPAL_BANKS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </Field>

      <Field label="Account holder name" error={errors.accountHolderName?.[0]} hint="Must match your bank records exactly">
        <input id="s4-accountHolderName" className={inputCls} value={form.accountHolderName} onChange={set("accountHolderName")} />
      </Field>

      <Field label="Account number" error={errors.accountNumber?.[0]} hint="Digits only, 8–20 characters">
        <input id="s4-accountNumber" className={inputCls} inputMode="numeric" value={form.accountNumber} onChange={set("accountNumber")} />
      </Field>

      <Field label="Branch name" error={errors.branchName?.[0]}>
        <input id="s4-branchName" className={inputCls} value={form.branchName} onChange={set("branchName")} placeholder="e.g. Thamel, Kathmandu" />
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
          id="s4-submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {mutation.isPending ? "Saving…" : "Save & continue →"}
        </button>
      </div>
    </form>
  );
}
