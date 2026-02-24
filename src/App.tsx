import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hub from "./pages/Hub";
import Index from "./pages/Index";
import CortesHub from "./pages/CortesHub";
import CortesProgramBuilder from "./pages/CortesProgramBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/melhores-momentos" element={<Index mode="mm" />} />
          <Route path="/jogo-completo" element={<Index mode="jc" />} />
          <Route path="/ao-vivo" element={<Index mode="av" />} />
          <Route path="/cortes" element={<CortesHub />} />
          <Route path="/cortes/:id" element={<CortesProgramBuilder />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
