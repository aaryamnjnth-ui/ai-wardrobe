import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Modal from '../UI/Modal';
import ClothingForm from '../Wardrobe/ClothingForm';
import { useWardrobe } from '../../hooks/useWardrobe';

const titleMap = {
  '/': 'Wardrobe Overview',
  '/wardrobe': 'My Wardrobe Collection',
  '/outfits': 'AI Outfit Studio',
  '/advisor': 'AI Style Advisor',
  '/stats': 'Wardrobe Analytics & Gaps',
};

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || 'AuraStyle AI';

  // Global wardrobe hook for the quick add action
  const { addItem, reload } = useWardrobe();

  const handleCreated = async (newItem) => {
    setIsAddModalOpen(false);
    // Reload or trigger custom event so child page catches it
    window.dispatchEvent(new CustomEvent('wardrobe:item_added', { detail: newItem }));
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickAdd={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={pageTitle}
          onRefresh={() => reload()}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ onOpenAddModal: () => setIsAddModalOpen(true) }} />
        </main>
      </div>

      {/* Global Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Clothing Piece"
        subtitle="Catalog garment specifications, category, brand, and imagery"
      >
        <ClothingForm
          onSubmit={async (formData) => {
            const res = await addItem(formData);
            handleCreated(res);
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Layout;
