import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, BarChart3, Users, MessageSquare, ClipboardList, Shield } from 'lucide-react';
import { Footer } from '../components/common/Footer';

export const Landing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'Pipeline Management',
      desc: 'Track leads from discovery to closure using structured, status-based sales funnels.',
      icon: ClipboardList,
    },
    {
      title: 'Historical Audit Logging',
      desc: 'Automatic activity timelines trace every status revision, assignee shift, and note update.',
      icon: BarChart3,
    },
    {
      title: 'Role-Based Protections',
      desc: 'Secure view/write scopes gate client features and database operations for members vs admins.',
      icon: Shield,
    },
    {
      title: 'Note Collaboration',
      desc: 'Quickly write timeline annotations to keep team members aligned on customer discussions.',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between relative overflow-hidden text-gray-100">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px] -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[130px] -z-10" />

      {/* Navigation Header */}
      <header className="container mx-auto px-6 h-20 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="font-bold text-white text-xl animate-pulse">L</span>
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            LeadFlow<span className="text-indigo-400">CRM</span>
          </span>
        </div>
        <div>
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/25 transition-all hover-scale inline-block"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-all hover-scale inline-block"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col z-10">
        <section className="container mx-auto px-6 py-20 text-center max-w-4xl">
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            Next-Generation Client Tracking
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mt-6 leading-tight">
            Accelerate your sales pipeline with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              LeadFlowCRM
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Monitor client lifecycle updates, track notes, and observe historical team events with a state-of-the-art interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 hover-scale"
            >
              <span>{user ? 'Enter Workspace' : 'Get Started Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/submit-lead"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/15 hover:border-white/25 flex items-center justify-center gap-2 transition-all hover-scale"
            >
              <span>Public Lead Intake Form</span>
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="container mx-auto px-6 py-20 border-t border-white/5 bg-slate-950/20">
          <div className="max-w-xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Full-Featured Platform</h2>
            <p className="text-gray-400 mt-3 text-sm">
              Engineered with clean architectural principles to drive team alignment and speed up sales operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="glass-panel p-6 rounded-2xl border border-white/5 hover-scale"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-100">{feat.title}</h3>
                  <p className="text-gray-400 text-sm mt-3 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
export default Landing;
