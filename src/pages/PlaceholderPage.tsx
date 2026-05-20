// ============================================================
// SPOTLY — PlaceholderPage.tsx  (src/pages/PlaceholderPage.tsx)
// Stub for pages not yet implemented
// ============================================================

import React from 'react';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
    <Construction size={36} strokeWidth={1.5} />
    <h2 className="text-lg font-semibold text-[#0D1B2A]">{title}</h2>
    <p className="text-sm">This section is under construction.</p>
  </div>
);

export default PlaceholderPage;
