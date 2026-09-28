"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DetailRow from "../global/DetailRow";
import QRGenerator from "../global/QRGenerator";
import { Context } from "../global/Context";
import { TransferBatchAPI } from "../utils/apiclient";
import type { RecipientQrModel, TransferModel } from "../utils/types/models";



export default function ReceiveBatch() {
  const { sessionToken, userData, companyData } = useContext(Context);

  const [selectedTransfer, setSelectedTransfer] = useState<TransferModel | null>(null);
  const [transferList, setTransferList] = useState<TransferModel[]>([]);
  const [recipientData, setRecipientData] = useState<RecipientQrModel | null>(null);
  const [popupVisibility, setPopupVisibility] = useState<"ShowQrCode" | "ApproveOrRejectTransfer" | "None">("None");
  const [filteredTransferList, setFilteredTransferList ] = useState<TransferModel[]>([]);
  const [showUserOnlyTransfers, setShowUserOnlyTransfers] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "rejected">("all");
  const router = useRouter();

  // Refreshes the pending transfer list
  const refreshTransferList = useCallback(() => {
    if (!sessionToken) {
      alert("You must be logged in to view transfers.");
      router.replace("/login");
      return;
    }
    TransferBatchAPI.getTransferList(sessionToken)
      .then((response) => {
        // Filter the transfer list to only include transfers to the current company
        const tempCompanyTransferList = response
          .filter(transfer => transfer.toCompanyId === companyData?.companyId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTransferList(tempCompanyTransferList);
        setSelectedTransfer(null);
      })
      .catch((error) => {
        console.error("There was an error while fetching the transfer list:", error);
        alert("Failed to fetch transfer list.");
      });
  }, [sessionToken, router]);

  // Refreshes the pending transfer list when the sessionToken changes and upon loading the page
  useEffect(() => {
    if (!sessionToken) return;
    refreshTransferList();
  }, [sessionToken, refreshTransferList]);

  useEffect(() => {
    setStatusFilter("all");
  }, []);

  // Sets the recipient data
  useEffect(() => {
    if (!userData || !companyData) return;
    setRecipientData({
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      companyId: companyData.companyId,
      companyName: companyData.companyName,
      walletAddress: companyData.walletAddress,
    });
  }, [userData, companyData]);

  useEffect(() => {
    setSelectedTransfer(null);
    setPopupVisibility("None");

    let tempFilteredTransferList = transferList;

    showUserOnlyTransfers && (tempFilteredTransferList = tempFilteredTransferList.filter(transfer => transfer.receivingUserId === userData?.userId));
    tempFilteredTransferList = tempFilteredTransferList.filter(transfer => {
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return isActiveStatus(transfer.status);
      if (statusFilter === "completed") return transfer.status === "completed";  
      if (statusFilter === "rejected") return transfer.status === "rejected";
    });

    setFilteredTransferList(tempFilteredTransferList);
  }, [showUserOnlyTransfers, statusFilter]);

  const isActiveStatus = (status: TransferModel["status"]) => status === "pending" || status === "accepted";

  const handleSelectItem = (item: TransferModel) => {
    setPopupVisibility("ApproveOrRejectTransfer");
    setSelectedTransfer(item);
  };

  // Accepts a transfer in the backend
  const acceptBatch = (item: TransferModel) => {
    if (!sessionToken) {
      router.replace("/login");
      return;
    }
    TransferBatchAPI.acceptTransfer(sessionToken, item.transferId)
      .then((response) => {
        console.log(response.message);
        setSelectedTransfer(null);
        setPopupVisibility("None");
        refreshTransferList();
      })
      .catch((error) => {
        console.error("Error while accepting transfer:", error);
        alert("Failed to accept transfer.");
      });
  };

  // Rejects a transfer in the backend
  const rejectBatch = (item: TransferModel) => {
    if (!sessionToken) {
      router.replace("/login");
      return;
    }
    TransferBatchAPI.rejectTransfer(sessionToken, item.transferId)
      .then((response) => {
        console.log(response.message);
        setSelectedTransfer(null);
        setPopupVisibility("None");
        refreshTransferList();
      })
      .catch((error) => {
        console.error("Error while rejecting transfer:", error);
        alert("Failed to reject transfer.");
      });
  };

  
  

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <div className="flex flex-row gap-2 w-full">
            <button
              className="btn btn-sm w-full"
              onClick={() => setPopupVisibility("ShowQrCode")}
            >
              Show Your QR
            </button>
          </div>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
            <legend className="fieldset-legend">Incoming Transfer requests</legend>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" className="btn" onClick={refreshTransferList}>
                Refresh
              </button>
              <label className="label cursor-pointer gap-2 p-0">
                <span className="label-text">Only mine</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={showUserOnlyTransfers}
                  onChange={(e) => setShowUserOnlyTransfers(e.target.checked)}
                />
              </label>
            </div>
            <div className="flex flex-row gap-3 w-full">
              <button
                type="button"
                className={`btn flex-1 min-w-0 ${statusFilter === "all" ? "btn-primary" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All
              </button>
              <button
                type="button"
                className={`btn flex-1 min-w-0 ${statusFilter === "active" ? "btn-primary" : ""}`}
                onClick={() => setStatusFilter("active")}
              >
                Active
              </button>
              <button
                type="button"
                className={`btn flex-1 min-w-0 ${statusFilter === "completed" ? "btn-primary" : ""}`}
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </button>
              <button
                type="button"
                className={`btn flex-1 min-w-0 ${statusFilter === "rejected" ? "btn-primary" : ""}`}
                onClick={() => setStatusFilter("rejected")}
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
        </div>
      </div>
      {popupVisibility === "ShowQrCode" && <QrWindow />}
      {popupVisibility === "ApproveOrRejectTransfer" && selectedTransfer && <ApproveOrRejectTransfer transfer={selectedTransfer} />}

    </div>
  );
  
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
        onClick={() => {
          handleSelectItem(transfer);
          setPopupVisibility("ApproveOrRejectTransfer");
        }}
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
        {transfer.status === "pending" && (
          <button
            type="button"
            className="btn btn-sm btn-outline w-full mt-3"
            onClick={() => {
              handleSelectItem(transfer);
              setPopupVisibility("ApproveOrRejectTransfer");
            }}
          >
            Review transfer
          </button>
        )}
      </div>
    );
  }
  function QrWindow() {
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          aria-label="Close dialog"
          onClick={() => setPopupVisibility("None")}
        />
        <div
          className="relative z-10 w-full max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-qr-modal-title"
        >
          <h2 id="batch-qr-modal-title" className="text-lg font-bold">
            Receiving Company QR code
          </h2>
          <p className="text-sm text-base-content/70 mt-1">{recipientData?.companyName}</p>
          <p
            className="text-xs font-mono text-base-content/50 truncate mt-1"
            title={recipientData?.companyId}
          >
            {recipientData?.companyId}
          </p>
          <div className="mt-4 flex justify-center">
            <QRGenerator data={JSON.stringify(recipientData)} />
          </div>
          <button
            type="button"
            className="btn btn-primary w-full mt-6"
            onClick={() => setPopupVisibility("None")}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
  function ApproveOrRejectTransfer({ transfer }: { transfer: TransferModel }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
          aria-label="Close dialog"
          onClick={() => setPopupVisibility("None")}
        />
        <div
          className="relative z-10 w-full max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="batch-qr-modal-title"
        >
          <h2 id="batch-qr-modal-title" className="text-lg font-bold">
            {transfer.batchName}
          </h2>
          <p
            className="text-xs font-mono text-base-content/50 truncate mt-1"
            title={transfer.batchId}
          >
            {transfer.batchId}
          </p>
          <br/>
          <DetailRow label="Route" value={`${transfer.fromCompanyName} → ${transfer.toCompanyName}`} />
          <DetailRow label="Requested by" value={transfer.senderUserName} />
          <DetailRow label="Created" value={new Date(transfer.createdAt).toLocaleString()} />
          {transfer.status === "pending" && (
              <div className="flex flex-row gap-3 w-full">
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => acceptBatch(transfer)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => rejectBatch(transfer)}
                >
                  Reject
                </button>
              </div>
          )}
          {transfer.status === "accepted" && (
            <div className="text-sm text-base-content/70 mt-1">{transfer.status}</div>
          )}
          {transfer.status === "rejected" && (
            <div className="text-sm text-base-content/70 mt-1">{transfer.status}</div>
          )}
          {transfer.status === "completed" && (
            <div className="text-sm text-base-content/70 mt-1">{transfer.status}</div>
          )}
          
          <button
            type="button"
            className="btn btn-primary w-full mt-6"
            onClick={() => setPopupVisibility("None")}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}
