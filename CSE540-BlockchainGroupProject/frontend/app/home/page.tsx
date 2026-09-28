import ProtectedRoute from "../components/global/ProtectedRoute";
import HomePage from "../components/home/HomePage";

export default function HomePagePath() {

  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}

