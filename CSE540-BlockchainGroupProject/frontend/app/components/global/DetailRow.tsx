"use client";

type DetailRowProps = {
  label: string;
  value: string;
  mono?: boolean;
};

// Displays a label and value pair
export default function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <div className="mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`text-sm font-medium ${mono ? "font-mono text-xs break-all" : ""}`}>{value}</div>
    </div>
  );
}
