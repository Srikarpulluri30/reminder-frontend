import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

/**
 * Layout Component
 * Standard layout wrapper for authenticated / app pages.
 */
export default function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
