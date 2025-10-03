
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import PublicLandNotifications from "./pages/PublicLandNotifications";
import RelatedLinksToLand from "./pages/RelatedLinksToLand";
import DepartmentDashboard from "./components/department-dashboard/DepartmentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ValuationPortal from "./pages/ValuationPortal";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import PlotManagement from "./pages/PlotManagement";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/public-land-notifications" element={<PublicLandNotifications />} />
            <Route path="/related-links-to-land" element={<RelatedLinksToLand />} />
            <Route path="/department-dashboard" element={<DepartmentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/valuation" element={<ValuationPortal />} />
            <Route path="/reports" element={<ReportsAnalytics />} />
            <Route path="/plots" element={<PlotManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
