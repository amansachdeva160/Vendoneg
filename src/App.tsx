import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import NewProcurement from './pages/NewProcurement';
import VendorQuotationUpload from './pages/VendorQuotationUpload';
import WorkflowManager from './pages/WorkflowManager';
import AgentPage from './pages/AgentPage';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import VendorDirectory from './pages/VendorDirectory';
import DatabaseInspector from './pages/DatabaseInspector';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-procurement" element={<NewProcurement />} />
            <Route path="/vendor-quotations" element={<VendorQuotationUpload />} />
            <Route path="/workflow" element={<WorkflowManager />} />
            <Route path="/agent/:agentId" element={<AgentPage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/vendors" element={<VendorDirectory />} />
            <Route path="/database" element={<DatabaseInspector />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
