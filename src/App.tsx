import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ParentDashboard from "@/pages/ParentDashboard";
import ChildProfiles from "@/pages/ChildProfiles";
import DoctorDiscovery from "@/pages/DoctorDiscovery";
import BookAppointment from "@/pages/BookAppointment";
import Appointments from "@/pages/Appointments";
import Telemedicine from "@/pages/Telemedicine";
import Notifications from "@/pages/Notifications";
import DoctorDashboard from "@/pages/DoctorDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'doctor') return <Navigate to="/doctor" replace />;
  return <Navigate to="/parent" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/unauthorized" element={<Unauthorized />} />
    <Route path="/" element={<RootRedirect />} />

    {/* Parent routes */}
    <Route path="/parent" element={<ProtectedRoute allowedRoles={['parent']}><Layout><ParentDashboard /></Layout></ProtectedRoute>} />
    <Route path="/children" element={<ProtectedRoute allowedRoles={['parent']}><Layout><ChildProfiles /></Layout></ProtectedRoute>} />
    <Route path="/children/:childId" element={<ProtectedRoute allowedRoles={['parent']}><Layout><ChildProfiles /></Layout></ProtectedRoute>} />
    <Route path="/doctors" element={<ProtectedRoute allowedRoles={['parent']}><Layout><DoctorDiscovery /></Layout></ProtectedRoute>} />
    <Route path="/book/:doctorId" element={<ProtectedRoute allowedRoles={['parent']}><Layout><BookAppointment /></Layout></ProtectedRoute>} />
    <Route path="/appointments" element={<ProtectedRoute allowedRoles={['parent']}><Layout><Appointments /></Layout></ProtectedRoute>} />
    <Route path="/telemedicine" element={<ProtectedRoute allowedRoles={['parent']}><Layout><Telemedicine /></Layout></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

    {/* Doctor routes */}
    <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorDashboard /></Layout></ProtectedRoute>} />
    <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['doctor']}><Layout><DoctorDashboard /></Layout></ProtectedRoute>} />

    {/* Admin routes */}
    <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
    <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
    <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
    <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
