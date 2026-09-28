"use client";

import { useRouter } from "next/navigation";

interface CardProps {
  action: string;
  route: string;
}
// Displays a card with an action and a route
export default function Card({ action, route }: CardProps) {
  const router = useRouter();

  return (
    <div className="card bg-base-200 border border-base-300 shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="card-body">
        <h2 className="card-title text-xl">{action}</h2>
        <div className="card-actions justify-end mt-3">
          <button type="button" onClick={() => router.push(route)} className="btn btn-sm btn-neutral">
            Open
          </button>
        </div>
      </div>
    </div>
  );
}