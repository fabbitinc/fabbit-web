import { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "@/pages/landing-page";
import { PricingPage } from "@/pages/pricing-page";
import { PilotFormModal } from "@/components/pilot-form-modal";

const PilotContext = createContext<() => void>(() => {});

export function usePilotModal() {
  return useContext(PilotContext);
}

export function App() {
  const [pilotOpen, setPilotOpen] = useState(false);

  return (
    <PilotContext.Provider value={() => setPilotOpen(true)}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/pricing"
            element={<PricingPage onPilotClick={() => setPilotOpen(true)} />}
          />
        </Routes>
        <PilotFormModal isOpen={pilotOpen} onClose={() => setPilotOpen(false)} />
      </BrowserRouter>
    </PilotContext.Provider>
  );
}
