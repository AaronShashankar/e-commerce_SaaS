import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveSeller,
  deactivateSeller,
  getSellers,
  rejectSeller,
} from "../api/sellers.js";

const filters = [
  ["all", "All"],
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
];
const label = (value) => value.charAt(0).toUpperCase() + value.slice(1);

export default function ManageSellers() {
  const [status, setStatus] = useState("all");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(null);
  const queryClient = useQueryClient();
  const sellers = useQuery({
    queryKey: ["sellers", status],
    queryFn: () => getSellers(status === "all" ? undefined : status),
  });
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["sellers"] });
  const approve = useMutation({
    mutationFn: approveSeller,
    onSuccess: refresh,
  });
  const reject = useMutation({
    mutationFn: rejectSeller,
    onSuccess: () => {
      setRejecting(null);
      setReason("");
      refresh();
    },
  });
  const deactivate = useMutation({
    mutationFn: deactivateSeller,
    onSuccess: () => {
      setConfirming(null);
      refresh();
    },
  });
  const mutationError = approve.error || reject.error || deactivate.error;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="flex items-center justify-between">
        <div>
          <Link className="text-sm text-indigo-600" to="/">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold">Manage sellers</h1>
        </div>
      </header>
      <div className="mt-6 flex gap-2">
        {filters.map(([key, text]) => (
          <button
            key={key}
            onClick={() => setStatus(key)}
            className={`rounded px-3 py-1.5 ${status === key ? "bg-indigo-600 text-white" : "border bg-white"}`}
          >
            {text}
          </button>
        ))}
      </div>
      {mutationError && (
        <p className="mt-4 rounded bg-red-50 p-3 text-red-700">
          {mutationError.response?.data?.message ||
            "The action could not be completed."}
        </p>
      )}
      <section className="mt-6 overflow-x-auto rounded-xl bg-white shadow">
        {sellers.isLoading ? (
          <div className="space-y-3 p-6 animate-pulse">
            <div className="h-5 rounded bg-slate-200" />
            <div className="h-5 rounded bg-slate-200" />
            <div className="h-5 rounded bg-slate-200" />
          </div>
        ) : sellers.isError ? (
          <p className="p-6 text-red-700">
            {sellers.error.response?.data?.message || "Unable to load sellers."}
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Business name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Submitted</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.data.length === 0 ? (
                <tr>
                  <td className="p-6 text-slate-500" colSpan="5">
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.data.map((seller) => (
                  <tr className="border-b last:border-0" key={seller.id}>
                    <td className="p-4 font-medium">{seller.businessName}</td>
                    <td className="p-4">{seller.user.email}</td>
                    <td className="p-4">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-slate-100 px-2 py-1">
                        {label(seller.approvalStatus)}
                        {!seller.user.isActive && " · inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      {seller.approvalStatus === "pending" && (
                        <div className="flex gap-2">
                          <button
                            disabled={approve.isPending}
                            onClick={() => approve.mutate(seller.id)}
                            className="rounded bg-emerald-600 px-3 py-1 text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejecting(seller)}
                            className="rounded border border-red-300 px-3 py-1 text-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {seller.approvalStatus === "approved" &&
                        seller.user.isActive && (
                          <button
                            onClick={() => setConfirming(seller)}
                            className="rounded border border-red-300 px-3 py-1 text-red-700"
                          >
                            Deactivate
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>
      {rejecting && (
        <div className="fixed inset-0 grid place-items-center bg-slate-900/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              reject.mutate({ id: rejecting.id, reason });
            }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold">
              Reject {rejecting.businessName}
            </h2>
            <label className="mt-4 block text-sm">
              Reason (optional)
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className="mt-1 w-full rounded border p-2"
                rows="3"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
              <button
                disabled={reject.isPending}
                className="rounded bg-red-600 px-3 py-2 text-white"
              >
                Reject seller
              </button>
            </div>
          </form>
        </div>
      )}
      {confirming && (
        <div className="fixed inset-0 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold">Deactivate seller?</h2>
            <p className="mt-2 text-slate-600">
              {confirming.businessName} will no longer be able to sign in.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirming(null)}
                className="rounded border px-3 py-2"
              >
                Cancel
              </button>
              <button
                disabled={deactivate.isPending}
                onClick={() => deactivate.mutate(confirming.id)}
                className="rounded bg-red-600 px-3 py-2 text-white"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
