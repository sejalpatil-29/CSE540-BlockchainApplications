import ProtectedRoute from "@/app/components/global/ProtectedRoute";
import RegisterBatch from "@/app/components/home/RegisterBatch";

export default function RegisterBatchPath() {

  return (
    <ProtectedRoute>
      <RegisterBatch />
    </ProtectedRoute>
   
  );
}