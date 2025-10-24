"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, FileText, Mail, User as UserIcon, Download, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface Application {
  id: string;
  jobId: number;
  name: string;
  email: string;
  coverLetter: string;
  cvFileUrl?: string; // Add CV file URL field
  createdAt: string;
  status: string;
  feedback?: string | null;
  withdrawn: boolean;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-200 text-gray-500',
};

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<any[]>([]); // <-- moved here
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const router = useRouter();
  const [expandedCovers, setExpandedCovers] = useState<{ [id: string]: boolean }>({});

  // Helper function to extract filename from S3 URL
  const getFileNameFromUrl = (url: string): string => {
    try {
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      // Remove UUID prefix if present (format: uuid_filename.pdf)
      const nameParts = fileName.split('_');
      if (nameParts.length > 1) {
        return nameParts.slice(1).join('_');
      }
      return fileName;
    } catch {
      return 'resume.pdf';
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchJobs();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/job-applications');
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        setError(data.error || 'Failed to fetch applications.');
      }
    } catch (err) {
      setError('Failed to fetch applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs/list');
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setJobs([]);
    }
  };

  const handleWithdraw = async (id: string) => {
    setWithdrawing(id);
    try {
      const res = await fetch('/api/job-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'withdraw' }),
      });
      if (res.ok) {
        await fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to withdraw application.');
      }
    } catch (err) {
      alert('Failed to withdraw application.');
    } finally {
      setWithdrawing(null);
    }
  };

  const handleEdit = (app: Application) => {
    setEditingId(app.id);
    setEditCoverLetter(app.coverLetter);
    setEditName(app.name);
    setEditEmail(app.email);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch('/api/job-applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          action: 'edit',
          coverLetter: editCoverLetter,
          name: editName,
          email: editEmail,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        setEditCoverLetter('');
        setEditName('');
        setEditEmail('');
        await fetchApplications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update application.');
      }
    } catch (err) {
      alert('Failed to update application.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-purple-100 via-blue-50 to-white dark:from-purple-900 dark:via-slate-900 dark:to-black">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent dark:from-purple-900/40" />
      {/* Header */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/10 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push('/job-board')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
            >
              <div className="size-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Briefcase className="size-5 text-white" />
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                Networkqy
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/job-board')}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Jobs</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6 z-10 relative">
        <h1 className="text-4xl font-semibold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-blue-500 to-purple-400 dark:from-purple-200 dark:via-blue-300 dark:to-purple-400 flex items-center gap-4 tracking-tight leading-normal" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
          <FileText className="size-9 text-purple-500 dark:text-purple-300 align-middle" />
          My Job Applications
        </h1>
        {loading && <div className="text-lg text-gray-700 dark:text-gray-200">Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && applications.length === 0 && (
          <div className="text-gray-700 dark:text-gray-200">No job applications found.</div>
        )}
        {!loading && !error && applications.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {applications.map(app => {
              // Updated: match on job.job_id (string) and app.jobId (string/number)
              const job = jobs.find(j => String(j.job_id) === String(app.jobId));
              const showFullCover = expandedCovers[app.id] || false;
              const coverPreview = app.coverLetter.length > 300 && !showFullCover ? app.coverLetter.slice(0, 300) + '...' : app.coverLetter;
              return (
                <div
                  key={app.id}
                  className="relative bg-white/95 dark:bg-slate-900/95 rounded-xl p-5 flex flex-col gap-3 border border-black dark:border-white shadow-md hover:shadow-xl hover:scale-[1.025] transition-all duration-150 min-h-[15rem] h-full max-w-md w-full mx-auto font-sans"
                >
                  {/* Header: logo, job title, company */}
                  <div className="flex items-center gap-3 mb-1">
                    {job?.logo && (
                      <img
                        src={job.logo}
                        alt={job.job_title}
                        className="size-12 rounded-md border border-purple-100 bg-white object-cover shadow-sm"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== window.location.origin + '/imagetemplate.png') {
                            target.src = '/imagetemplate.png';
                          }
                        }}
                      />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-semibold text-purple-700 dark:text-purple-300 truncate">
                        {job?.employer_name || 'Unknown Company'}
                      </span>
                      {job?.job_country && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
                          {job.job_country}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-tight whitespace-normal break-words tracking-tight mb-1">
                    {job?.job_title || 'Unknown Role'}
                  </div>

                  {/* Location and submission date */}
                  <div className="flex flex-wrap gap-2 mb-1 text-sm text-gray-500 dark:text-gray-400 font-normal">
                    {(job?.job_city || job?.job_state) && (
                      <span>
                        {job.job_city ? job.job_city : ''}
                        {job.job_city && job.job_state ? ', ' : ''}
                        {job.job_state ? job.job_state : ''}
                      </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status and feedback badges */}
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border shadow-sm tracking-wide ${app.withdrawn
                        ? 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'
                        : app.status === 'pending'
                          ? 'bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-200 border-yellow-100 dark:border-yellow-700'
                          : app.status === 'reviewed'
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 border-blue-100 dark:border-blue-700'
                            : app.status === 'accepted'
                              ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 border-green-100 dark:border-green-700'
                              : app.status === 'rejected'
                                ? 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-200 border-red-100 dark:border-red-700'
                                : 'bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700'
                      }`}>
                      {app.withdrawn ? 'Withdrawn' : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    {app.feedback && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-200 border border-green-100 dark:border-green-700 shadow-sm tracking-wide">
                        Feedback
                      </span>
                    )}
                  </div>

                  {/* Applicant info */}
                  <div className="flex flex-col gap-1 mb-1 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <UserIcon className="size-4 text-purple-400" />
                      <span className="font-semibold text-gray-900 dark:text-white break-words whitespace-normal">{app.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-purple-300" />
                      <span className="break-words whitespace-normal">{app.email}</span>
                    </div>
                  </div>

                  {/* Cover letter preview */}
                  <div className="mb-2">
                    <span className="font-semibold text-sm text-purple-700 dark:text-purple-200">Cover Letter:</span>
                    <div className="mt-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <pre className="whitespace-pre-wrap break-words text-sm max-h-24 overflow-auto">
                        {coverPreview}
                      </pre>
                      {app.coverLetter.length > 300 && (
                        <button
                          className="text-xs text-purple-600 dark:text-purple-300 mt-2 underline hover:text-purple-800 font-medium"
                          onClick={() => setExpandedCovers(prev => ({ ...prev, [app.id]: !showFullCover }))}
                        >
                          {showFullCover ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* CV/Resume section */}
                  <div className="mb-2">
                    <span className="font-semibold text-sm text-purple-700 dark:text-purple-200">Resume/CV:</span>
                    {app.cvFileUrl ? (
                      <div className="mt-1 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300 font-medium">Resume uploaded</span>
                          </div>
                          <div className="flex gap-1 sm:gap-2 flex-wrap">
                            <button
                              className="px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors duration-150 flex items-center gap-1"
                              onClick={() => window.open(app.cvFileUrl, '_blank')}
                            >
                              <ExternalLink className="size-3" />
                              <span className="hidden xs:inline">View</span>
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors duration-150 flex items-center gap-1"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = app.cvFileUrl!;
                                link.download = getFileNameFromUrl(app.cvFileUrl!);
                                link.click();
                              }}
                            >
                              <Download className="size-3" />
                              <span className="hidden xs:inline">Download</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">No resume uploaded</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer: actions */}
                  <div className="flex gap-2 pt-2 border-t border-purple-100 dark:border-purple-800 justify-end items-end w-full mt-auto">
                    {!app.withdrawn ? (
                      <>
                        <button
                          className="flex-1 py-2 px-4 rounded font-bold text-sm flex items-center justify-center
                            bg-red-600 text-white shadow-md border-none
                            transition-colors duration-150
                            hover:bg-red-700 active:bg-red-800
                            focus:outline-none focus:ring-2 focus:ring-red-400
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={withdrawing === app.id}
                          onClick={() => handleWithdraw(app.id)}
                        >
                          {withdrawing === app.id ? 'Withdrawing...' : 'Withdraw'}
                        </button>
                        <button
                          className="flex-1 py-2 px-4 rounded font-bold text-sm flex items-center justify-center
                            bg-purple-700 text-white shadow-md border-none
                            transition-colors duration-150
                            hover:bg-purple-800 active:bg-purple-900
                            focus:outline-none focus:ring-2 focus:ring-purple-400
                            disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={editingId !== null}
                          onClick={() => handleEdit(app)}
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <div className="w-full text-center text-xs text-gray-400 italic py-2">
                        You have withdrawn this application.
                      </div>
                    )}
                  </div>

                  {/* Decorative gradient bar */}
                  <div className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 opacity-30 group-hover:opacity-60 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Edit Modal (custom, no Headless UI) */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-xl p-8 max-w-lg w-full z-10">
            <div className="text-xl font-bold mb-4 text-purple-700 dark:text-purple-200">Edit Application</div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-200">Name</label>
              <input
                type="text"
                className="w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                disabled={savingEdit}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-200">Email</label>
              <input
                type="email"
                className="w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                disabled={savingEdit}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-purple-700 dark:text-purple-200">Cover Letter</label>
              <textarea
                className="w-full rounded border border-purple-300 dark:border-purple-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
                rows={6}
                value={editCoverLetter}
                onChange={e => setEditCoverLetter(e.target.value)}
                disabled={savingEdit}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditingId(null)} disabled={savingEdit}>Cancel</Button>
              <Button variant="default" onClick={handleEditSave} disabled={savingEdit || (!editCoverLetter.trim() && !editName.trim() && !editEmail.trim())}>
                {savingEdit ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 