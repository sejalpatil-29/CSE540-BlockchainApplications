"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (result: string) => void;
};


// This component uses the device camera to scan QR codes in real-time. When a QR code is detected, the decoded result is passed to the onScan callback prop.
export default function QRCamera({ onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);
  const hasStartedRef = useRef(false);
  const scannerId = "qr-reader";

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onScan(decodedText);

          if (isRunningRef.current) {
            scanner.stop().catch(() => {});
            isRunningRef.current = false;
          }
        },
        () => {}
      )
      .then(() => {
        isRunningRef.current = true;
      })
      .catch((err: any) => {
        console.error(err);

        const msg = err?.message || err?.toString() || "";

        if (msg.includes("NotAllowedError")) {
          alert("Camera permission denied. Please enable it in your browser.");
        }
        onScan("")
      });

    return () => {
      if (isRunningRef.current && scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, []);

  return <div id={scannerId} style={{ width: "300px" }} />;
}