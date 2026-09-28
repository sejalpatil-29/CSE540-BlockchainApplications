"use client";

import { useEffect, useState } from "react";
import DetailRow from "../../global/DetailRow";
import type { TransferModel } from "../../utils/types/models";

type Props = {
  transferList: TransferModel[];
  refreshTransferList: () => void;
};

export default function ViewTransfersComponent({ transferList, refreshTransferList }: Props) {
  const [filteredTransferList, setFilteredTransferList ] = useState<TransferModel[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "rejected">("all");

  const isActiveStatus = (status: TransferModel["status"]) => status === "pending" || status === "accepted";
  // Sorts the transfer list by creation date
  const sortedTransferList = [...transferList].sort((a, b) => {
    const aIsActive = isActiveStatus(a.status);
    const bIsActive = isActiveStatus(b.status);
    if (aIsActive !== bIsActive) return aIsActive ? -1 : 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  useEffect(() => {
    handleFilterButtonClick("all");
  }, []);
  
  const handleFilterButtonClick = (filter: "all" | "active" | "completed" | "rejected") => {
    
    setFilteredTransferList(sortedTransferList.filter(transfer => {
      if (filter === "all") return true;
      if (filter === "active") return isActiveStatus(transfer.status);
      if (filter === "completed") return transfer.status === "completed";
      if (filter === "rejected") return transfer.status === "rejected";
    }));
  };
  
  return (
    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
      <legend className="fieldset-legend">Transfer requests</legend>
      <button type="button" className="btn" onClick={refreshTransferList}>
        Refresh
      </button>
      <div className="flex flex-row gap-3 w-full">
        <button 
          type="button" 
          className={`btn flex-1 min-w-0 ${statusFilter === "all" ? "btn-primary" : ""}`} 
          onClick={() => {handleFilterButtonClick("all"); setStatusFilter("all");}}
        >
          All
        </button>
        <button 
          type="button" 
          className={`btn flex-1 min-w-0 ${statusFilter === "active" ? "btn-primary" : ""}`} 
          onClick={() => {handleFilterButtonClick("active"); setStatusFilter("active");}}
        >
          Active
        </button>
        <button 
          type="button" 
          className={`btn flex-1 min-w-0 ${statusFilter === "completed" ? "btn-primary" : ""}`} 
          onClick={() => {handleFilterButtonClick("completed"); setStatusFilter("completed");}}
        >
          Completed
        </button>
        <button 
          type="button" 
          className={`btn flex-1 min-w-0 ${statusFilter === "rejected" ? "btn-primary" : ""}`} 
          onClick={() => {handleFilterButtonClick("rejected"); setStatusFilter("rejected");}}
        >
          Rejected
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {filteredTransferList.length === 0 && (
          <div className="p-4 border rounded-lg text-sm text-gray-600">No transfer requests yet.</div>
        )}
        {filteredTransferList.map((transferRequest) => (
          <TransferCard key={transferRequest.transferId} transfer={transferRequest} />
        ))}
      </div>
    </fieldset>
  );
}

// Transfer card component
function TransferCard({ transfer }: { transfer: TransferModel }) {
  const getStatusClassName = (status: TransferModel["status"]) => {
    if (status === "completed") return "text-green-600";
    if (status === "accepted") return "text-blue-600";
    if (status === "pending") return "text-yellow-600";
    if (status === "rejected") return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div
      key={transfer.transferId}
      className="p-4 border rounded-lg shadow hover:bg-gray-900/50 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold">{transfer.batchName}</div>
          <div className="text-xs text-gray-500">Batch ID: {transfer.batchId}</div>
        </div>
        <div className={`text-sm font-medium ${getStatusClassName(transfer.status)}`}>
          {transfer.status}
        </div>
      </div>

      <div className="mt-3">
        <DetailRow
          label="Route"
          value={`${transfer.fromCompanyName} → ${transfer.toCompanyName}`}
        />
        <DetailRow label="Requested by" value={transfer.senderUserName} />
        <DetailRow label="Created" value={new Date(transfer.createdAt).toLocaleString()} />
      </div>
    </div>
  );
}