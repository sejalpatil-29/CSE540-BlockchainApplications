"use client";

import { useState, type ReactNode } from "react";
import QRCamera from "./global/QRCamera";
import QRFile from "./global/QRFile";
import DetailRow from "./global/DetailRow";
import { BatchModel, BatchQrModel, TransferModel } from "./utils/types/models";
import { BatchAPI } from "./utils/apiclient";
import type { LineageEdge } from "./utils/types/api-contract";

export default function SupplyChain() {
    const [itemQrValue, setItemQrValue] = useState<BatchQrModel | null>(null);
    const [hasScannedItem, setHasScannedItem] = useState(false);

    const [hasItemHistory, setHasItemHistory] = useState(false);
    const [itemHistory, setItemHistory] = useState<BatchModel[]>([]);
    const [lineageEdges, setLineageEdges] = useState<LineageEdge[]>([]);
    const [transfers, setTransfers] = useState<TransferModel[]>([]);

    const handleItemScan = (result: string) => {
        console.log(result);
        try {
            const parsedValue = JSON.parse(result) as BatchQrModel;
            setItemQrValue(parsedValue);
            setHasScannedItem(true);
        } catch (error) {
            console.error("Error parsing item QR value:", error);
            alert("Could not read item QR code. Please scan a valid item QR code.");
        }
    };

    const transferHistoryCard = (batch: BatchModel) => {
        const legs = transfers.filter((t) => String(t.batchId) === String(batch.batchId));
        const isVerified = batch.varifiedDataOnChain;

        return (
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="card-title text-base">{batch.batchName}</h4>
                    {isVerified === true || isVerified === false ? (
                        <span
                            className={`text-lg leading-none ${isVerified ? "text-success" : "text-error"}`}
                            title={isVerified ? "Verification passed" : "Verification failed"}
                            aria-label={isVerified ? "Verification passed" : "Verification failed"}
                        >
                            {isVerified ? "✅" : "❌"}
                        </span>
                    ) : null}
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <DetailRow label="BatchName" value={batch.batchName} />
                    <DetailRow label="BatchID" value={String(batch.batchId)} />
                    <div>
                        <p className="text-sm text-gray-500">Transfer history</p>
                        {legs.length === 0 ? (
                            <p className="text-sm font-medium">—</p>
                        ) : (
                            <ul className="mt-1 space-y-1 text-sm font-medium">
                                {legs.map((transfer) => (
                                    <li key={transfer.transferId}>
                                        {transfer.fromCompanyName} → {transfer.toCompanyName}
                                        <span className="ml-1 text-xs font-normal opacity-70">
                                            ({transfer.status})
                                        </span>
                                        {transfer.varifiedTransferOnChain === true || transfer.varifiedTransferOnChain === false ? (
                                            <span
                                                className={`ml-2 text-base leading-none ${transfer.varifiedTransferOnChain ? "text-success" : "text-error"}`}
                                                title={transfer.varifiedTransferOnChain ? "Transfer verification passed" : "Transfer verification failed"}
                                                aria-label={transfer.varifiedTransferOnChain ? "Transfer verification passed" : "Transfer verification failed"}
                                            >
                                                {transfer.varifiedTransferOnChain ? "✅" : "❌"}
                                            </span>
                                        ) : null}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    function buildProvenancePath(batch: BatchModel): ReactNode {
        const sourceIds = batch.sourceBatchIds ?? [];
        const sources = sourceIds
            .map((sourceBatchId) =>
                itemHistory.find((b) => String(b.batchId) === String(sourceBatchId))
            )
            .filter((b): b is BatchModel => b != null);

        const childBox = (
            <div className="rounded-box shrink-0 border border-base-300 bg-base-100 p-4">
                {transferHistoryCard(batch)}
            </div>
        );

        if (sources.length === 0) {
            return childBox;
        }

        return (
            <div className="flex flex-row flex-wrap items-start gap-4">
                {childBox}
                <div className="min-w-0 flex-1 rounded-box border border-primary/25 bg-base-200/40 p-3">
                    <p className="card-title text-base">
                        Source batches
                    </p>
                    <div className="flex flex-row flex-nowrap items-start gap-3 overflow-x-auto pb-1">
                        {sources.map((sourceBatch) => (
                            <div key={String(sourceBatch.batchId)} className="min-w-0 shrink-0">
                                {buildProvenancePath(sourceBatch)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const getItemHistory = () => {
        if (!itemQrValue) return;

        BatchAPI.getSupplyChainHistory(itemQrValue.batchId)
            .then((response) => {
                setItemHistory(response.batches);
                setLineageEdges(response.lineageEdges);
                setTransfers(response.transfers ?? []);
                setHasItemHistory(true);
            })
            .catch((error) => {
                console.error("Error fetching item history:", error);
                alert("Failed to fetch item history.");
            });
    };

    const backToItemDetails = () => {
        setHasItemHistory(false);
        setItemHistory([]);
        setLineageEdges([]);
        setTransfers([]);
    };

    const scanDifferentItem = () => {
        backToItemDetails();
        setHasScannedItem(false);
        setItemQrValue(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center pb-40">
                {!hasScannedItem ? (
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                        <legend className="fieldset-legend">Scan Item QR Code</legend>
                        <h2 className="text-lg font-bold mb-3">Scan the item QR code</h2>
                        <p className="text-sm text-gray-600 mb-4">Use the camera or upload an image of the QR code.</p>
                        <div className="flex flex-col gap-3">
                            <QRCamera onScan={handleItemScan} />
                            <QRFile onScan={handleItemScan} />
                        </div>
                    </fieldset>
                ) : (
                    <>
                    {!hasItemHistory ? (
                    <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                        <legend className="fieldset-legend">Item Details</legend>
                        <button className="btn" onClick={() => { setHasScannedItem(false); setItemQrValue(null); }}>Scan Different Item</button>
                        <div className="flex flex-col gap-3">
                            <DetailRow label="Item ID" value={itemQrValue?.batchId ?? ""} />
                            <DetailRow label="Item Name" value={itemQrValue?.batchName ?? ""} />
                            <DetailRow label="Item Description" value={itemQrValue?.batchDescription ?? ""} />
                            <DetailRow label="Status" value={itemQrValue?.blockchainStatus ?? ""} />
                        </div>
                        <button className="btn" onClick={getItemHistory}>View Item History</button>
                    </fieldset>
                    ) : (
                        <>
                        <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4">
                            <legend className="fieldset-legend">Item History</legend>
                            <div className="flex flex-col gap-3 overflow-x-auto">
                                {(() => {
                                    const root = itemHistory.find(
                                        (b) => String(b.batchId) === String(itemQrValue?.batchId)
                                    );
                                    return root ? (
                                        buildProvenancePath(root)
                                    ) : (
                                        <p className="text-sm opacity-70">No batch data for this item.</p>
                                    );
                                })()}
                            </div>
                        </fieldset>
                        </>
                    )}
                </>
                )}
            </div>
        </div>
    );
}

