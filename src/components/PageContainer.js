import React from 'react';
import MainHeader from './MainHeader';

// Simple page wrapper that provides padding and max-width below the persistent header
export default function PageContainer({ children, className = '' }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50/50 via-white to-white">
      <MainHeader />
      <main className={`flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 ${className}`}>{children}</main>
      <footer className="mt-auto py-10 text-center text-xs text-gray-400">© {new Date().getFullYear()} OrangeMantra Carpool</footer>
    </div>
  );
}
