
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Navigation } from "./components/layout/Navigation";
import { AuthProvider } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Trading from "./pages/Trading";
import Bots from "./pages/Bots";
import Social from "./pages/Social";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Testing from "./pages/Testing";
import RealTrading from "./pages/RealTrading";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/trading" element={<ProtectedRoute><Trading /></ProtectedRoute>} />
                  <Route path="/real-trading" element={<ProtectedRoute><RealTrading /></ProtectedRoute>} />
                  <Route path="/bots" element={<ProtectedRoute><Bots /></ProtectedRoute>} />
                  <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/testing" element={<ProtectedRoute><Testing /></ProtectedRoute>} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
