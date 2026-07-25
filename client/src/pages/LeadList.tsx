import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Lead, User, LeadStatus, LeadPriority } from '../types';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  X,
  Users2,
} from 'lucide-react';

export const LeadList: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    priority: 'MEDIUM' as LeadPriority,
    assignedTo: '' as string,
    tags: '',
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Fetch Users (for assignment dropdown)
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users-list'],
    queryFn: async () => {
      // Members can query users too, but let's handle if it fails gracefully
      try {
        const res = await apiClient.get('/users');
        return res.data.data;
      } catch (err) {
        return [];
      }
    },
    enabled: !!currentUser,
  });

  // Fetch Leads with filters
  const { data, isLoading, error } = useQuery<{ data: Lead[]; pagination: { total: number } }>({
    queryKey: ['leads', { search, status, priority, assignedTo, sortBy, page }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
      });
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (assignedTo) params.append('assignedTo', assignedTo);

      const res = await apiClient.get(`/leads?${params.toString()}`);
      return res.data;
    },
  });

  const leads = data?.data || [];
  const totalLeads = data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalLeads / limit);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await apiClient.post('/leads', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create lead');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await apiClient.patch(`/leads/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setEditingLead(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to update lead');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      priority: 'MEDIUM',
      assignedTo: '',
      tags: '',
    });
    setFormError(null);
  };

  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || '',
      priority: lead.priority,
      assignedTo: lead.assignedTo?._id || '',
      tags: lead.tags.join(', '),
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      ...formData,
      assignedTo: formData.assignedTo === '' ? null : formData.assignedTo,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    if (editingLead) {
      updateMutation.mutate({ id: editingLead._id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(id);
    }
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

  const getPriorityColor = (pr: LeadPriority) => {
    const map = {
      LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return map[pr] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="space-y-6 w-full text-left relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track your customer opportunities.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/10 hover-scale cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
        >
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="PROPOSAL">Proposal</option>
          <option value="NEGOTIATION">Negotiation</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Assigned To Filter (Admins only get all, Members get list pre-filtered by backend, but this dropdown lists users for selection) */}
        {currentUser?.role === 'ADMIN' && (
          <select
            value={assignedTo}
            onChange={(e) => {
              setAssignedTo(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
          >
            <option value="">All Assignees</option>
            <option value="null">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        )}

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm lg:col-span-1"
        >
          <option value="createdAt:desc">Newest Created</option>
          <option value="createdAt:asc">Oldest Created</option>
          <option value="updatedAt:desc">Recently Updated</option>
          <option value="name:asc">Name (A-Z)</option>
        </select>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-64 bg-white/5 rounded" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <span>Error loading leads. Please check your network connection.</span>
        </div>
      ) : leads.length === 0 ? (
        <div className="glass-panel py-16 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
          <Users2 className="w-12 h-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No leads found</h3>
          <p className="text-gray-500 text-sm max-w-xs mt-1">
            Try adjusting your search filters or add a new lead to get started.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/20 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="p-4 pl-6">Name</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-gray-200">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-4 pl-6 font-medium text-white">
                      <div className="flex flex-col">
                        <span>{lead.name}</span>
                        <span className="text-xs text-gray-400 mt-0.5">{lead.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{lead.company || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 text-xxs font-bold">
                            {lead.assignedTo.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span>{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-600">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lead)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/5 transition-all cursor-pointer"
                          title="Edit Lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
              <span>
                Showing <strong className="text-white">{(page - 1) * limit + 1}</strong> to{' '}
                <strong className="text-white">{Math.min(page * limit, totalLeads)}</strong> of{' '}
                <strong className="text-white">{totalLeads}</strong> leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal - Create/Edit Lead */}
      {(isCreateOpen || editingLead) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-xl glass-panel p-8 rounded-2xl border border-white/10 flex flex-col relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setEditingLead(null);
                resetForm();
              }}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-white mb-6">
              {editingLead ? 'Edit Lead Opportunity' : 'Add New Lead'}
            </h2>

            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Lead Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Hooli Inc"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Source Channel
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="LinkedIn / Referral"
                    className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              {currentUser?.role === 'ADMIN' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Assign To User
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="saas, enterprise, hot-deal"
                  className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingLead(null);
                    resetForm();
                  }}
                  className="h-11 px-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
                >
                  {editingLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeadList;
