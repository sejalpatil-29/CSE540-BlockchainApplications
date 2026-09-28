import ProtectedRoute from "@/app/components/global/ProtectedRoute";
import SendBatch from "@/app/components/home/SendBatch/SendBatchPage";

export default function SendBatchPage() {
  return (
    <ProtectedRoute>  
      <SendBatch />
    </ProtectedRoute>
    
  );
}