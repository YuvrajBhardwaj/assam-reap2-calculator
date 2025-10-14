import React from 'react';

const Loader: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    {/* Tailwind CSS circle animation */}
    <div className="w-12 h-12 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
  </div>
);

export default Loader;