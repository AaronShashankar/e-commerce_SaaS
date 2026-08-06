import { Link } from "react-router-dom";

export default function SubmittedScreen() {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
        🎉
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-900">Application Submitted!</h2>
      <p className="mt-3 max-w-sm text-slate-600">
        Your seller application is now under review. Our team typically processes
        applications within <strong>1–2 business days</strong>.
      </p>

      <div className="mt-8 w-full max-w-sm rounded-xl border border-amber-200 bg-amber-50 px-6 py-5 text-left">
        <p className="text-sm font-semibold text-amber-800">What happens next?</p>
        <ul className="mt-3 space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2"><span>📋</span> Our admin team reviews your KYC and business documents</li>
          <li className="flex items-start gap-2"><span>🔔</span> You'll receive a notification when a decision is made</li>
          <li className="flex items-start gap-2"><span>✅</span> Once approved, you can start listing products immediately</li>
        </ul>
      </div>

      <Link
        to="/seller/dashboard"
        className="mt-8 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Go to my dashboard
      </Link>
    </div>
  );
}
