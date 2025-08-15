/**
 * 🎯 MASTER FILE: Advanced Analytics Dashboard Screen
 * 
 * Comprehensive analytics dashboard screen that provides detailed business insights,
 * revenue tracking, client analysis, and performance metrics with beautiful
 * visualizations using Chart.js.
 * 
 * Status: ✅ PRODUCTION READY
 * Last Updated: August 15, 2025
 */

import React from 'react';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';

const AdvancedAnalyticsDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnalyticsDashboard />
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
