import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lead, Note, Activity, User, LeadStatus } from '../types';
import {
  ArrowLeft,
  Calendar,
  User as UserIcon,
  Phone,
  Mail,
  Building,
  History,
  MessageSquare,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [noteMessage, setNoteMessage] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  // Fetch Users (for Admin re-assignment dropdown)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users-list'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/users');
        return res.data.data;
      } catch (err) {
        return [];
      }
    },
    enabled: currentUser?.role === 'ADMIN',
  });

  // Fetch Lead Details
  const { data: lead, isLoading: leadLoading, error: leadError } = useQuery<Lead>({
    queryKey: ['lead', id],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${id}`);
      return res.data.data;
    },
  });

  // Fetch Notes
  const { data: notes = [], isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['lead-notes', id],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${id}/notes`);
      return res.data.data;
    },
  });

  // Fetch Activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['lead-activities', id],
    queryFn: async () => {
      const res = await apiClient.get(`/leads/${id}/activity`);
      return res.data.data;
    },
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async (status: LeadStatus) => {
      return await apiClient.patch(`/leads/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', id] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (assignedTo: string | null) => {
      return await apiClient.patch(`/leads/${id}/assign`, { assignedTo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', id] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (message: string) => {
      return await apiClient.post(`/leads/${id}/notes`, { message });
    },
    onSuccess: () => {
      setNoteMessage('');
      queryClient.invalidateQueries({ queryKey: ['lead-notes', id] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities', id] });
    },
    onError: (err: any) => {
      setNoteError(err.response?.data?.message || 'Failed to add note');
    },
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    setNoteError(null);
    if (!noteMessage.trim()) return;
    addNoteMutation.mutate(noteMessage);
  };

  const getStatusColor = (st: LeadStatus) => {
    const map = {
      NEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      CONTACTED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      QUALIFIED: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      PROPOSAL: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      NEGOTIATION: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      WON: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      LOST: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return map[st] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getActivityActionColor = (action: string) => {
    const map = {
      'Lead Created': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Status Changed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Assigned User': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Note Added': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Lead Updated': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      'Lead Deleted': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return (map as any)[action] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  if (leadLoading) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel h-80 rounded-2xl bg-white/5" />
            <div className="glass-panel h-80 rounded-2xl bg-white/5" />
          </div>
          <div className="glass-panel h-96 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (leadError || !lead) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
        <AlertCircle className="w-6 h-6" />
        <span>Failed to load lead details. Access denied or resource not found.</span>
      </div>
    );
  }

  const pipeline: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

  return (
    <div className="space-y-6 w-full text-left">
      <Link
        to="/leads"
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors group self-start"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Leads
      </Link>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{lead.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
            <span className="text-xs text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
              Priority: {lead.priority}
            </span>
            {lead.source && (
              <span className="text-xs text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                Source: {lead.source}
              </span>
            )}
          </div>
        </div>

        {/* Pipeline switches */}
        <div className="flex flex-col gap-2">
          <span className="text-xxs font-bold uppercase tracking-wider text-gray-400">Update status pipeline</span>
          <div className="flex flex-wrap gap-1 bg-slate-950/40 p-1 rounded-xl border border-white/5">
            {pipeline.map((stage) => (
              <button
                key={stage}
                onClick={() => updateStatusMutation.mutate(stage)}
                disabled={updateStatusMutation.isPending}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold transition-all cursor-pointer ${
                  lead.status === stage
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Metadata & Notes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Metadata Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              <span>Company & Contact Metadata</span>
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Email:</span>
                  <a href={`mailto:${lead.email}`} className="text-indigo-400 hover:underline">
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Phone:</span>
                  <span className="text-white">{lead.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white">{lead.company || '—'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Updated:</span>
                  <span className="text-white">{new Date(lead.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Creator:</span>
                  <span className="text-white">{lead.createdBy?.name || 'System'}</span>
                </div>
              </div>
            </div>

            {/* Tags display */}
            {lead.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-white/5">
                <span className="text-xs text-gray-500 mr-2">Tags:</span>
                {lead.tags.map((t) => (
                  <span key={t} className="text-xxs px-2 py-0.5 roundedbg-indigo-500/10 text-indigo-400 border border-indigo-500/10 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Notes Collaboration</span>
            </h3>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder="Write a timeline update or action item..."
                rows={3}
                className="w-full p-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              {noteError && <p className="text-xs text-rose-400">{noteError}</p>}
              <button
                type="submit"
                disabled={addNoteMutation.isPending || !noteMessage.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer ml-auto block disabled:opacity-40"
              >
                {addNoteMutation.isPending ? 'Saving...' : 'Add Note'}
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              {notes.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No annotations recorded yet.</p>
              ) : (
                notes.map((note) => (
                  <div key={note._id} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex gap-4 text-sm leading-relaxed">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0 mt-0.5">
                      {note.userId?.name?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-200">{note.userId?.name || 'User'}</span>
                        <span className="text-xxs text-gray-500">
                          {new Date(note.createdAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-400 whitespace-pre-wrap">{note.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assignment & Timeline */}
        <div className="space-y-8">
          {/* Assignment panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
            <h3 className="text-md font-bold text-white">Lead Assignee</h3>
            
            {lead.assignedTo ? (
              <div className="p-4 rounded-xl bg-indigo-600/5 border border-indigo-500/10 flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {lead.assignedTo.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200">{lead.assignedTo.name}</h4>
                  <span className="text-xxs uppercase tracking-wider text-indigo-400 font-bold">{lead.assignedTo.role}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-white/10 text-center text-sm text-gray-500">
                Opportunity is currently Unassigned.
              </div>
            )}

            {/* Admin Assign Select */}
            {currentUser?.role === 'ADMIN' && (
              <div className="pt-2">
                <label className="block text-xxs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Change Assignment
                </label>
                <select
                  value={lead.assignedTo?._id || ''}
                  onChange={(e) => assignMutation.mutate(e.target.value === '' ? null : e.target.value)}
                  disabled={assignMutation.isPending}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                >
                  <option value="">Unassign</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Timeline Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>Activity Timeline</span>
            </h3>

            <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 -ml-4">No events logged yet.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="relative text-sm">
                    {/* Circle icon on the line */}
                    <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-slate-900 border-2 border-indigo-500" />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xxs font-semibold border ${getActivityActionColor(act.action)}`}>
                          {act.action}
                        </span>
                        <span className="text-xxs text-gray-500">
                          {new Date(act.createdAt).toLocaleString(undefined, {
                            timeStyle: 'short',
                            dateStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-gray-300">
                        {act.action === 'Lead Created' && `Lead created in pipeline by ${act.userId?.name || 'User'}`}
                        {act.action === 'Note Added' && `Note annotations saved by ${act.userId?.name || 'User'}`}
                        {act.action === 'Lead Updated' && `Details revised by ${act.userId?.name || 'User'}`}
                        {act.action === 'Status Changed' && (
                          <>
                            Status shifted from <span className="text-indigo-400 font-semibold">{act.oldValue}</span> to{' '}
                            <span className="text-indigo-400 font-semibold">{act.newValue}</span> by {act.userId?.name || 'User'}
                          </>
                        )}
                        {act.action === 'Assigned User' && (
                          <>
                            Assignee changed from <span className="text-indigo-400 font-semibold">{act.oldValue}</span> to{' '}
                            <span className="text-indigo-400 font-semibold">{act.newValue}</span> by {act.userId?.name || 'User'}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeadDetails;
