
import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const PublicLandNotifications = lazy(() => import('./pages/PublicLandNotifications'));
const RelatedLinksToLand = lazy(() => import('./pages/RelatedLinksToLand'));
const ReportsAnalytics = lazy(() => import('./pages/ReportsAnalytics'));


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
          <Routes>
            <Route path="/" element={<Suspense fallback={<div>Loading...</div>}><Index /></Suspense>} />
            <Route path="/about-us" element={<Suspense fallback={<div>Loading...</div>}><AboutUs /></Suspense>} />
            <Route path="/contact" element={<Suspense fallback={<div>Loading...</div>}><Contact /></Suspense>} />
            <Route path="/public-land-notifications" element={<Suspense fallback={<div>Loading...</div>}><PublicLandNotifications /></Suspense>} />
            <Route path="/related-links-to-land" element={<Suspense fallback={<div>Loading...</div>}><RelatedLinksToLand /></Suspense>} />
            <Route path="/reports" element={<Suspense fallback={<div>Loading...</div>}><ReportsAnalytics /></Suspense>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Suspense fallback={<div>Loading...</div>}><NotFound /></Suspense>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
