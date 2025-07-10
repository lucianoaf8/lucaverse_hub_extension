import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function DevCenterHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Development Center</h1>
        <p className="text-neutral-400 mt-1">Build, test, and optimize your application</p>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors font-medium"
        >
          🚀 Launch Production
        </button>
      </div>
    </div>
  );
}