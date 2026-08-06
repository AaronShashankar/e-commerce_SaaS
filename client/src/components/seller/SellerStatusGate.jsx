import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMySellerProfile } from "../../api/seller.js";
import SellerOnboarding from "../../pages/seller-onboarding/SellerOnboarding.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function SellerPending() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <div className="mb-4 text-5xl">⏳</div>
        <h1 className="text-2xl font-bold text-slate-900">Under Review</h1>
        <p className="mt-3 text-slate-600">
          Your seller application has been submitted and is awaiting admin
          review. This typically takes <strong>1–2 business days</strong>.
        </p>
        <p className="mt-4 text-sm text-amber-700">
          You'll receive a notification once a decision has been made.
        </p>
      </div>
    </main>
  );
}

function SellerRejected({ seller }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
        <div className="mb-4 text-5xl">❌</div>
        <h1 className="text-2xl font-bold text-slate-900">Application Not Approved</h1>
        <p className="mt-3 text-slate-600">
          Unfortunately, your seller application was not approved at this time.
        </p>

        {seller?.rejectionReason && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Reason from admin
            </p>
            <p className="mt-1 text-sm text-red-800">{seller.rejectionReason}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-slate-500">
          You can update your application and resubmit for review.
        </p>

        <button
          onClick={() => navigate("/seller/onboarding?resubmit=true")}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Edit Application &amp; Resubmit
        </button>
      </div>
    </main>
  );
}

export default function SellerStatusGate({ children }) {
  const { user } = useAuth();

  const {
    data: seller,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["seller", "me"],
    queryFn: getMySellerProfile,
    enabled: !!user && user.role === "seller",
  });

  if (isLoading)
    return (
      <p className="p-8 text-center text-slate-500">
        Checking seller account status…
      </p>
    );

  if (isError)
    return (
      <p className="p-8 text-center text-red-700">
        Unable to load your seller account status. Please try again.
      </p>
    );

  // draft → redirect into wizard at their saved step
  if (!seller || seller.approvalStatus === "draft") {
    return <SellerOnboarding />;
  }

  if (seller.approvalStatus === "pending") return <SellerPending />;
  if (seller.approvalStatus === "rejected") return <SellerRejected seller={seller} />;

  // approved → render children (dashboard)
  return children;
}
