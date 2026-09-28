"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRGenerator from "../global/QRGenerator";
import DetailRow from "../global/DetailRow";
import QRCamera from "../global/QRCamera";
import QRFile from "../global/QRFile";
import { Context } from "../global/Context";
import { BatchAPI } from "../utils/apiclient";
import type { CreateBatchRequest } from "../utils/types/api-contract";
import type { BatchModel, BatchQrModel } from "../utils/types/models";
import { BatchBlockchainStatus } from "../utils/types/primitives";
  

export default function RegisterBatch() {
  const [batchList, setBatchList] = useState<BatchModel[]>([]);
  const [qrBatchWindow, setQrBatchWindow] = useState<BatchQrModel | null>(null);
  const [viewSelect, setViewSelect] = useState<"register" | "list">("list");
  const [itemNameInput, setItemNameInput] = useState("");
  const [itemDescriptionInput, setItemDescriptionInput] = useState("");
  const [sourceBatchDataList, setSourceBatchDataList] = useState<Array<BatchQrModel | null>>([]);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);

  const { sessionToken } = useContext(Context);
  const router = useRouter();

  const refreshBatchList = useCallback(() => {
    if (!sessionToken) {
      alert("You must be logged in to view batches.");
      router.push("/login");
      return;
    }

    BatchAPI.getBatchList(sessionToken)
      .then((response) => {
        setBatchList(response);
      })
      .catch((error) => {
        console.error("Error fetching batch list:", error);
        alert("Failed to fetch batch list.");
      });
  }, [sessionToken, router]);

  useEffect(() => {
    if (!sessionToken) return;
    refreshBatchList();
  }, [sessionToken, refreshBatchList]);

  useEffect(() => {
    if (!qrBatchWindow) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrBatchWindow(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [qrBatchWindow]);

  const handleRefreshBatchListClick = () => {
    refreshBatchList();
    setQrBatchWindow(null);
  };

  const clearFields = () => {
    setItemNameInput("");
    setItemDescriptionInput("");
    setSourceBatchDataList([]);
    setExpandedSourceIndex(null);
  };

  const addSourceRow = () => {
    setSourceBatchDataList((prev) => [...prev, null]);
  };

  const removeSourceRow = (index: number) => {
    setSourceBatchDataList((prev) => prev.filter((_, i) => i !== index));
    setExpandedSourceIndex((cur) =>
      cur === index ? null : cur != null && cur > index ? cur - 1 : cur
    );
  };

  const clearSourceRow = (index: number) => {
    setSourceBatchDataList((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setExpandedSourceIndex((current) => (current === index ? null : current));
  };

  const applyQrAtIndex = (index: number, result: string) => {
    if (!result.trim()) return;
    try {
      const parsed = JSON.parse(result) as BatchQrModel;
      if (!parsed?.batchId || !parsed.blockchainStatus) throw new Error("Invalid batch QR payload");

      if (parsed.blockchainStatus === "failed") {
        alert("This batch has a failed blockchain status and cannot be used as a source.");
        return;
      }

      const isDuplicate = sourceBatchDataList.some(
        (existing, i) =>
          i !== index &&
          existing != null &&
          existing.batchId === parsed.batchId
      );
      if (isDuplicate) {
        alert("That batch is already in the source list.");
        return;
      }

      setSourceBatchDataList((prev) => {
        const next = [...prev];
        next[index] = parsed;
        return next;
      });
      setExpandedSourceIndex(null);
    } catch (error) {
      console.error("Error processing batch QR:", error);
      alert("Could not read batch QR. Use a valid batch QR from this app.");
    }
  };

  const submitItemBatch = () => {
    if (!sessionToken) {
      alert("You must be logged in to register a batch.");
      router.push("/login");
      return;
    }

    const tempName = itemNameInput.trim();
    const description = itemDescriptionInput.trim();
    if (!tempName || !description) {
      alert("Please enter an item name and description.");
      return;
    }

    const sourceBatchIds = sourceBatchDataList
      .filter((item): item is BatchQrModel => item != null && item.batchId !== "")
      .map((item) => item.batchId);

    const apiPayload: CreateBatchRequest = {
      batchName: tempName,
      batchDescription: description,
      sourceBatchIds: sourceBatchIds.length > 0 ? sourceBatchIds : [],
    };

    BatchAPI.registerBatch(sessionToken, apiPayload)
      .then((response) => {
        alert("Batch registered successfully! Batch ID: " + response.batchId);
        clearFields();
        refreshBatchList();
      })
      .catch((error) => {
        console.error("Error registering batch:", error);
        alert("Failed to register batch.");
      });
  };

  const toBatchQrPayload = (batch: BatchModel): BatchQrModel => ({
    batchId: batch.batchId,
    batchName: batch.batchName,
    batchDescription: batch.batchDescription ?? null,
    currentCompanyName: batch.currentCompanyName ?? batch.registeringCompanyName,
    blockchainStatus: batch.blockchain?.status ?? "pending",
  });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center pb-40">
        <div className="flex flex-col gap-4 p-4 w-full max-w-lg mx-auto">
          <div className="flex flex-row gap-2 w-full flex-wrap">
            <button 
              type="button"
              className="btn btn-sm flex-1 min-w-0"
              onClick={() => {setViewSelect("list"); handleRefreshBatchListClick();}}
            >
              View Registered Batches
            </button>
            <button
              type="button"
              className="btn btn-sm flex-1 min-w-0"
              onClick={() => setViewSelect("register")}
            >
              Register New Batch
            </button>
          </div>

          {viewSelect === "register" && (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Register Item Batch</legend>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Source batches (required if the registered batch is derived from other batches). Add rows and use Scan or upload on each empty row in any order, or leave the list empty.
                </p>
                <button type="button" className="btn btn-sm btn-outline mb-3" onClick={addSourceRow}>
                  Add source batch
                </button>
                <div className="flex flex-col gap-3">
                  {sourceBatchDataList.map((item, index) => {
                    const populated = item != null && item.batchId !== "";
                    return (
                      <div
                        key={index}
                        className="border border-base-300 rounded-lg p-3 bg-base-100 space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-sm font-medium">Source {index + 1}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => removeSourceRow(index)}
                          >
                            Remove
                          </button>
                        </div>

                        {populated ? (
                          <div className="space-y-1">
                            <DetailRow label="Batch ID" value={item.batchId} mono />
                            <DetailRow label="Name" value={item.batchName} />
                            <DetailRow label="Current company" value={item.currentCompanyName ?? "—"} />
                            <DetailRow label="Description" value={item.batchDescription ?? "—"} />
                            <DetailRow label="Blockchain status" value={item.blockchainStatus} />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline mt-2"
                              onClick={() => clearSourceRow(index)}
                            >
                              Clear / scan again
                            </button>
                          </div>
                        ) : expandedSourceIndex === index ? (
                          <div className="flex flex-col gap-2">
                            <QRCamera onScan={(data) => applyQrAtIndex(index, data)} />
                            <QRFile onScan={(data) => applyQrAtIndex(index, data)} />
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => setExpandedSourceIndex(null)}
                            >
                              Cancel scan
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm w-full sm:w-auto"
                            onClick={() => setExpandedSourceIndex(index)}
                          >
                            Scan or upload QR
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <div className="form-control w-full">
                  <label className="label">Item Name</label>
                  <input
                    className="input input-bordered w-full"
                    value={itemNameInput}
                    placeholder="Item Name"
                    onChange={(event) => setItemNameInput(event.target.value)}
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">Item Description</label>
                  <textarea
                    className="textarea textarea-bordered w-full min-h-24"
                    value={itemDescriptionInput}
                    placeholder="What is this item batch. Give some detail"
                    onChange={(event) => setItemDescriptionInput(event.target.value)}
                  />
                </div>
                <button type="button" className="btn w-full" onClick={submitItemBatch}>
                  Submit
                </button>
              </div>
            </fieldset>
          )}

          {viewSelect === "list" && (
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
              <legend className="fieldset-legend">Registered Batches</legend>
              <button type="button" className="btn" onClick={handleRefreshBatchListClick}>
                Refresh List
              </button>
              <div className="flex flex-col gap-3">
                {[...batchList]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((item) => (
                    <BatchCard
                      key={item.batchId}
                      batch={item}
                      onShowQr={() => setQrBatchWindow(toBatchQrPayload(item))}
                    />
                  ))}
                {batchList.length === 0 && (
                  <div className="p-4 border rounded-lg text-sm text-gray-600">No registered batches yet.</div>
                )}
              </div>
            </fieldset>
          )}
        </div>
      </div>
      <QrWindow qrBatchWindow={qrBatchWindow} setQrBatchWindow={setQrBatchWindow} />
    </div>
  );
}

function BatchCard({ batch, onShowQr }: { batch: BatchModel; onShowQr: () => void }) {
  const router = useRouter();
  const getBlockchainStatusClassName = (status: BatchBlockchainStatus) => {
    if (status === "confirmed") return "text-green-600";
    if (status === "pending") return "text-yellow-600";
    if (status === "failed") return "text-red-600";
    return "text-gray-600";
  };

  const holder = batch.currentCompanyName ?? batch.registeringCompanyName;

  return (
    <div className="p-4 border border-base-300 rounded-lg bg-base-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-lg">{batch.batchName}</div>
          <div className="text-xs text-gray-500 truncate" title={batch.batchId}>
            Batch ID: {batch.batchId}
          </div>
        </div>
        <div className="shrink-0 flex flex-row flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <span
            className={`text-sm font-medium whitespace-nowrap ${getBlockchainStatusClassName(batch.blockchain?.status ?? "pending")}`}
          >
            {batch.blockchain?.status}
          </span>
          <button type="button" className="btn btn-sm btn-outline" onClick={onShowQr}>
            Show QR
          </button>
        </div>
      </div>

      <div className="mt-3">
        <DetailRow
          label="Description"
          value={batch.batchDescription ?? "—"}
        />
        <DetailRow label="Owned by" value={batch.currentCompanyName!} />
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">Created</p>
            <div className="text-sm font-medium">
              {new Date(batch.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline shrink-0 self-end"
            onClick={() => router.push(`/home/sendbatch?batchId=${batch.batchId}`)}
          >
            Send Batch
          </button>
        </div>
      </div>
    </div>
  );
}

type QrWindowProps = {
  qrBatchWindow: BatchQrModel | null;
  setQrBatchWindow: (batch: BatchQrModel | null) => void;
}

function QrWindow({ qrBatchWindow, setQrBatchWindow }: QrWindowProps) {
  if (!qrBatchWindow) return null;
  const qrPayload = JSON.stringify(qrBatchWindow);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={() => setQrBatchWindow(null)}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-box border border-base-300 bg-base-100 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-qr-modal-title"
      >
        <h2 id="batch-qr-modal-title" className="text-lg font-bold">
          Batch QR code
        </h2>
        <p className="text-sm text-base-content/70 mt-1">{qrBatchWindow.batchName}</p>
        <p
          className="text-xs font-mono text-base-content/50 truncate mt-1"
          title={qrBatchWindow.batchId}
        >
          {qrBatchWindow.batchId}
        </p>
        <div className="mt-4 flex justify-center">
          <QRGenerator data={qrPayload} />
        </div>
        <button
          type="button"
          className="btn btn-primary w-full mt-6"
          onClick={() => setQrBatchWindow(null)}
        >
          Close
        </button>
      </div>
    </div>
  );
}