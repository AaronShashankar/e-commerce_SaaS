import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../hooks/useAuth.js";
import { getOnboarding, resubmitOnboarding } from "../../api/onboarding.js";
import Step1Account from "./steps/Step1Account.jsx";
import Step2Business from "./steps/Step2Business.jsx";
import Step3Kyc from "./steps/Step3Kyc.jsx";
import Step4Bank from "./steps/Step4Bank.jsx";
import Step5Store from "./steps/Step5Store.jsx";
import SubmittedScreen from "./SubmittedScreen.jsx";

const STEPS = [
  { number: 1, label: "Account" },
  { number: 2, label: "Business" },
  { number: 3, label: "KYC" },
  { number: 4, label: "Bank" },
  { number: 5, label: "Store" },
];

const STEP_TITLES = {
  1: "Create your seller account",
  2: "Business information",
  3: "KYC verification",
  4: "Bank details",
  5: "Store profile",
};

function StepIndicator({ current }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
              step.number < current
                ? "bg-indigo-600 text-white"
                : step.number === current
                ? "border-2 border-indigo-600 bg-white text-indigo-600 shadow-md shadow-indigo-100"
                : "border-2 border-slate-200 bg-white text-slate-400"
            }`}
          >
            {step.number < current ? "✓" : step.number}
          </div>
          <div className="mx-1 hidden flex-col items-center sm:flex">
            <span
              className={`text-xs font-medium ${
                step.number <= current ? "text-indigo-700" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`mx-1 h-0.5 w-8 transition-all sm:w-12 ${
                step.number < current ? "bg-indigo-600" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SellerOnboarding({ isResubmit = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // If already authenticated as seller, fetch saved onboarding data
  const { data: savedProfile, isLoading } = useQuery({
    queryKey: ["onboarding"],
    queryFn: getOnboarding,
    enabled: !!user && user.role === "seller",
    retry: false,
  });

  const [activeStep, setActiveStep] = useState(1);
  const [profile, setProfile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // On load, resume at the seller's saved step
  useEffect(() => {
    if (savedProfile) {
      setProfile(savedProfile);
      const resumeAt = savedProfile.onboardingStep ?? 1;
      // If step 5 is complete (pending/approved), show submitted screen unless resubmit
      if (
        savedProfile.approvalStatus === "pending" &&
        !isResubmit
      ) {
        setSubmitted(true);
      } else {
        setActiveStep(Math.min(resumeAt, 5));
      }
    }
  }, [savedProfile, isResubmit]);

  const resubmitMutation = useMutation({
    mutationFn: resubmitOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller", "me"] });
      navigate("/seller/dashboard", { replace: true });
    },
  });

  function handleStep1Success(updatedUser) {
    setProfile(null); // fresh profile
    setActiveStep(2);
  }

  function handleStepSuccess(updatedProfile) {
    setProfile(updatedProfile);
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    } else {
      // Step 5 done — if resubmit mode, call resubmit endpoint
      if (isResubmit) {
        resubmitMutation.mutate();
      } else {
        queryClient.invalidateQueries({ queryKey: ["seller", "me"] });
        setSubmitted(true);
      }
    }
  }

  function handleBack() {
    setActiveStep((s) => Math.max(1, s - 1));
  }

  if (isLoading && user?.role === "seller") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading your application…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4 py-10">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <span className="text-sm font-black text-white">M</span>
            </div>
            <span className="text-lg font-bold text-slate-900">MarketPlace</span>
          </Link>
          <p className="mt-2 text-sm text-slate-500">Seller Onboarding</p>
        </div>

        {!submitted ? (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <StepIndicator current={activeStep} />

            <h1 className="mb-6 text-xl font-bold text-slate-900">
              {isResubmit && activeStep === 5
                ? "Update your store profile"
                : STEP_TITLES[activeStep]}
            </h1>

            {activeStep === 1 && !user && (
              <Step1Account onSuccess={handleStep1Success} />
            )}
            {activeStep === 2 && (
              <Step2Business
                defaultValues={profile}
                onSuccess={handleStepSuccess}
                onBack={handleBack}
              />
            )}
            {activeStep === 3 && (
              <Step3Kyc
                defaultValues={profile}
                onSuccess={handleStepSuccess}
                onBack={handleBack}
              />
            )}
            {activeStep === 4 && (
              <Step4Bank
                defaultValues={profile}
                onSuccess={handleStepSuccess}
                onBack={handleBack}
              />
            )}
            {activeStep === 5 && (
              <Step5Store
                defaultValues={profile}
                onSuccess={handleStepSuccess}
                onBack={handleBack}
                isResubmit={isResubmit}
              />
            )}

            {resubmitMutation.isError && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {resubmitMutation.error?.response?.data?.message || "Resubmit failed. Please try again."}
              </p>
            )}

            <p className="mt-6 text-center text-xs text-slate-400">
              Step {activeStep} of 5
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <SubmittedScreen />
          </div>
        )}
      </div>
    </div>
  );
}
