import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full h-16 px-6 flex items-center justify-between border-b border-white/5">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="font-bold text-white text-lg">L</span>
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:inline-block">
            LeadFlow<span className="text-indigo-400">CRM</span>
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 pr-4 border-r border-white/10">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 border border-white/10">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-medium text-gray-200 leading-tight">
                {user.name}
              </span>
              <span className="text-xxs text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-rose-400 bg-white/0 hover:bg-rose-500/5 px-3 h-9 rounded-lg border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};
