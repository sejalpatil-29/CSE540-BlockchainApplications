import ProtectedRoute from "@/app/components/global/ProtectedRoute";
import ReceiveBatch from "@/app/components/home/ReceiveBatch";

export default function ReceiveBatchPage() {
  return (
        <ProtectedRoute>
          <ReceiveBatch />
        </ProtectedRoute>

  );
}