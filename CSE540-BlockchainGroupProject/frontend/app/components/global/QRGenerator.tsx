"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = {
  data: string;
};

// This component generates a QR code from the data prop and renders it as an image
export default function QRGenerator({data}: Props) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const generate = async () => {
      const url = await QRCode.toDataURL(data, {
        width: 420,
        margin: 2,
        errorCorrectionLevel: "M",
      });
      setQr(url);
    };

    generate();
  }, [data]);

  return (
    <div>
      {qr && <img src={qr} alt="QR Code" className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]" />}
    </div>
  );
}