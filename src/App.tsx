import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import PricingPage from "./pages/PricingPage.tsx";
import Platform from "./pages/Platform.tsx";
import PlaygroundPage from "./pages/PlaygroundPage.tsx";
import CaseStudiesPage from "./pages/CaseStudiesPage.tsx";
import Projects from "./pages/Projects.tsx";
import Articles from "./pages/Articles.tsx";
import BookCall from "./pages/BookCall.tsx";
import Terms from "./pages/Terms.tsx";
import Privacy from "./pages/Privacy.tsx";
import Templates from "./pages/Templates.tsx";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Account from "./pages/Account.tsx";
import GlobalShortcuts from "@/components/site/GlobalShortcuts";
import DemoModal from "@/components/site/DemoModal";
import Onboarding from "@/components/site/Onboarding";
import CommandPalette from "@/components/site/CommandPalette";
import Spotlight from "@/components/site/Spotlight";
import ProtectedRoute from "@/components/site/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <GlobalShortcuts />
          <Spotlight />
          <CommandPalette />
          <DemoModal />
          <Onboarding />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/cases" element={<CaseStudiesPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/book" element={<BookCall />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
