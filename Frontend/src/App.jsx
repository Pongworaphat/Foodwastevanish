import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/navbar";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";
import MydonationsPage from "./pages/MyDonationsPage";
import ReceivedPage from "./pages/ReceivedPage";
import CreateDonationPage from "./pages/CreateDonationPage";
import SigninPage from "./components/Navbar/Auth/SigninPage";
import SignupPage from "./components/Navbar/Auth/SignupPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import MyActivitiesPage from "./pages/MyActivitiesPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EditDonationPage from "./pages/EditDonationPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminDonations from "./pages/AdminDonations";
import AdminRoute from "./components/Navbar/AdminRoute";
import AdminFeedbacks from "./pages/AdminFeedbacks";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/signin" element={<SigninPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />


        {/* protected routes */}
        <Route
          path="/edit-donation/:id"
          element={
            <ProtectedRoute>
              <EditDonationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donate"
          element={
            <ProtectedRoute>
              <CreateDonationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mydonations"
          element={
            <ProtectedRoute>
              <MydonationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/received"
          element={
            <ProtectedRoute>
              <ReceivedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MyActivitiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/donations"
          element={
            <AdminRoute>
              <AdminDonations />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/feedbacks"
          element={
            <AdminRoute>
              <AdminFeedbacks />
            </AdminRoute>
          }
        />
        
      </Routes>
    </>
  );
}

export default App;