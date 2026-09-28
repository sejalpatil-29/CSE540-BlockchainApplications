import ProtectedRoute from "@/app/components/global/ProtectedRoute";
import UserProfile from "@/app/components/home/UserProfile";

export default function UserProfilePath() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
    
  );
}