import ProtectedRoute from "@/app/components/global/ProtectedRoute";
import CompanyProfile from "@/app/components/home/CompanyProfile";

export default function CompanyProfilePath() {


  return (
    <ProtectedRoute>
      <CompanyProfile />
    </ProtectedRoute>
    
  );
}