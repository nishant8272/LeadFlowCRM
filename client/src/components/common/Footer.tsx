import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto border-t border-gray-800 bg-slate-950/40 text-gray-400 text-center text-sm backdrop-blur-md">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          &copy; {new Date().getFullYear()} LeadFlowCRM. All rights reserved.
        </div>
        <div className="flex items-center gap-1">
          <span>Built for </span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors underline decoration-dotted"
          >
            Digital Heroes Training Task
          </a>
        </div>
      </div>
    </footer>
  );
};
