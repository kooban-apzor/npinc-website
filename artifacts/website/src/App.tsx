import { useEffect, useState, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import ServicesPage from "@/pages/ServicesPage";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import PeoplePage from "@/pages/PeoplePage";
import PersonDetailPage from "@/pages/PersonDetailPage";
import InsightsPage from "@/pages/InsightsPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import AwardsPage from "@/pages/AwardsPage";
import CalculatorPage from "@/pages/CalculatorPage";
import CareersPage from "@/pages/CareersPage";
import VacancyDetailPage from "@/pages/VacancyDetailPage";
import DocumentsPage from "@/pages/DocumentsPage";
import ContactPage from "@/pages/ContactPage";

import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminServices from "@/pages/admin/AdminServices";
import AdminPeople from "@/pages/admin/AdminPeople";
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminAwards from "@/pages/admin/AdminAwards";
import AdminVacancies from "@/pages/admin/AdminVacancies";
import AdminCvSubmissions from "@/pages/admin/AdminCvSubmissions";
import AdminDocuments from "@/pages/admin/AdminDocuments";
import AdminCalculatorRates from "@/pages/admin/AdminCalculatorRates";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";
import AdminSiteSettings from "@/pages/admin/AdminSiteSettings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
});

function AdminLoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-[#151515] border border-[#2A2A2A] p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-[#C6A15B] text-xs uppercase tracking-widest mb-2">Restricted Access</p>
          <h2 className="text-2xl font-serif text-[#F7F4EE]">Admin Login</h2>
        </div>
        <a href="/admin/login" className="block w-full bg-[#C6A15B] text-[#0E0E0E] py-4 text-sm font-semibold uppercase tracking-widest text-center hover:bg-[#9F7E3F] transition-colors mb-3">
          Go to Admin Login
        </a>
        <button onClick={onClose} className="block w-full border border-[#2A2A2A] text-[#B8B8B8] py-3 text-sm hover:border-[#C6A15B] transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/services/:slug">{({ slug }) => <ServiceDetailPage slug={slug} />}</Route>
      <Route path="/people" component={PeoplePage} />
      <Route path="/people/:slug">{({ slug }) => <PersonDetailPage slug={slug} />}</Route>
      <Route path="/insights" component={InsightsPage} />
      <Route path="/insights/:slug">{({ slug }) => <ArticleDetailPage slug={slug} />}</Route>
      <Route path="/events" component={EventsPage} />
      <Route path="/events/:slug">{({ slug }) => <EventDetailPage slug={slug} />}</Route>
      <Route path="/awards" component={AwardsPage} />
      <Route path="/calculator" component={CalculatorPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/careers/:slug">{({ slug }) => <VacancyDetailPage slug={slug} />}</Route>
      <Route path="/documents" component={DocumentsPage} />
      <Route path="/contact" component={ContactPage} />

      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/people" component={AdminPeople} />
      <Route path="/admin/articles" component={AdminArticles} />
      <Route path="/admin/events" component={AdminEvents} />
      <Route path="/admin/awards" component={AdminAwards} />
      <Route path="/admin/vacancies" component={AdminVacancies} />
      <Route path="/admin/cv-submissions" component={AdminCvSubmissions} />
      <Route path="/admin/documents" component={AdminDocuments} />
      <Route path="/admin/calculator-rates" component={AdminCalculatorRates} />
      <Route path="/admin/enquiries" component={AdminEnquiries} />
      <Route path="/admin/site-settings" component={AdminSiteSettings} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.altKey && e.key === "a") {
      e.preventDefault();
      setAdminModalOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <AdminLoginModal open={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
