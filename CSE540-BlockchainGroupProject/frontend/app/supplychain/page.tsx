"use client";

import SupplyChain from "@/app/components/SupplyChain";

export default function SupplyChainPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center pb-40">
        <SupplyChain />
      </div>
    </div>
  );
}