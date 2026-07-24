import { useQuery } from "@tanstack/react-query";
import { getMySellerProfile } from "../../api/seller.js";
import { SellerPending, SellerRejected } from "../../pages/Pages.jsx";

export default function SellerStatusGate({ children }) {
  const {
    data: seller,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["seller", "me"], queryFn: getMySellerProfile });
  if (isLoading)
    return <p className="p-8 text-center">Checking seller account status…</p>;
  if (isError)
    return (
      <p className="p-8 text-center text-red-700">
        Unable to load your seller account status. Please try again.
      </p>
    );
  if (seller.approvalStatus === "pending")
    return <SellerPending seller={seller} />;
  if (seller.approvalStatus === "rejected")
    return <SellerRejected seller={seller} />;
  return children;
}
