import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Wardrobe from './pages/Wardrobe';
import Outfits from './pages/Outfits';
import StyleAdvisor from './pages/StyleAdvisor';
import Statistics from './pages/Statistics';

export function App() {
  return (
    <BrowserRouter>
      {/* React Hot Toast with high-fashion dark glass theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1a2e',
            color: '#f8fafc',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px -5px rgba(124, 58, 237, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#ec4899',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="wardrobe" element={<Wardrobe />} />
          <Route path="outfits" element={<Outfits />} />
          <Route path="advisor" element={<StyleAdvisor />} />
          <Route path="stats" element={<Statistics />} />
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
