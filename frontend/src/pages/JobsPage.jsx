import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getJobs, updateJob, deleteJob } from '../api'

const STATUS_OPTIONS = ['pending', 'interview', 'offer', 'rejected', 'ghosted']

// Styled status badges
const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  interview: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  offer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
  ghosted: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

const STATUS_ICONS = {
  pending: '⏳',
  interview: '🎯',
  offer: '🎉',
  rejected: '✗',
  ghosted: '👻',
}

export default function JobsPage() {
  const { token, logout } = useAuth()

  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sortBy, setSortBy] = useState('DateApplied')
  const [sortOrder, setSortOrder] = useState('desc')

  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Fetch jobs on page load
  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await getJobs(token)
        setJobs(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [token])

  // Sorting (frontend-only)
  function getSortedJobs() {
    return [...jobs].sort((a, b) => {
      let valA = a[sortBy]
      let valB = b[sortBy]
      if (valA == null) return 1
      if (valB == null) return -1
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  function handleSort(field) {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Edit
  function startEditing(job) {
    setEditingId(job.id)
    setEditForm({
      title: job.title,
      companyName: job.companyName,
      salary: job.salary || '',
      description: job.description || '',
      Url: job.Url || '',
      Status: job.Status,
    })
  }

  function cancelEditing() {
    setEditingId(null)
    setEditForm({})
  }

  async function saveEdit(id) {
    try {
      const payload = {
        ...editForm,
        salary: editForm.salary ? parseInt(editForm.salary) : undefined,
        description: editForm.description || undefined,
        Url: editForm.Url || undefined,
      }
      const updated = await updateJob(id, payload, token)
      setJobs(jobs.map((j) => (j.id === id ? updated : j)))
      setEditingId(null)
    } catch (err) {
      alert(err.message)
    }
  }

  // Delete
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      await deleteJob(id, token)
      setJobs(jobs.filter((j) => j.id !== id))
    } catch (err) {
      alert(err.message)
    }
  }

  const sortedJobs = getSortedJobs()

  // Stats
  const stats = {
    total: jobs.length,
    interview: jobs.filter((j) => j.Status === 'interview').length,
    offer: jobs.filter((j) => j.Status === 'offer').length,
    pending: jobs.filter((j) => j.Status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted">Loading your jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💼</span>
            <span className="text-white font-semibold">Chakri Bakri</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/jobs/new"
              id="add-job-link"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-primary/30 active:scale-[0.97]"
            >
              + Add Job
            </Link>
            <button
              id="logout-btn"
              onClick={logout}
              className="text-muted hover:text-white text-sm px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
            { label: 'Interviews', value: stats.interview, color: 'text-blue-400' },
            { label: 'Offers', value: stats.offer, color: 'text-emerald-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-muted text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-4">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Sort controls */}
        <div className="flex items-center gap-2 mb-5 text-sm flex-wrap">
          <span className="text-muted font-medium">Sort:</span>
          {[
            { key: 'DateApplied', label: 'Date' },
            { key: 'title', label: 'Title' },
            { key: 'companyName', label: 'Company' },
            { key: 'Status', label: 'Status' },
            { key: 'salary', label: 'Salary' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                sortBy === key
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-card border border-border text-muted hover:text-white hover:border-primary/30'
              }`}
            >
              {label}
              {sortBy === key && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>

        {/* Job list */}
        {sortedJobs.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-white font-medium text-lg">No jobs tracked yet</p>
            <p className="text-muted text-sm mt-1 mb-6">Start by adding your first job application.</p>
            <Link
              to="/jobs/new"
              className="inline-block bg-primary hover:bg-primary-hover text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all shadow-md shadow-primary/20"
            >
              + Add Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/20 transition-all duration-200 group"
              >
                {editingId === job.id ? (
                  /* ---- EDIT MODE ---- */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Job Title"
                        className="bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <input
                        value={editForm.companyName}
                        onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                        placeholder="Company"
                        className="bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={editForm.salary}
                        onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                        placeholder="Salary"
                        className="bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <input
                        value={editForm.Url}
                        onChange={(e) => setEditForm({ ...editForm, Url: e.target.value })}
                        placeholder="URL"
                        className="bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <select
                        value={editForm.Status}
                        onChange={(e) => setEditForm({ ...editForm, Status: e.target.value })}
                        className="bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                      rows={2}
                      className="w-full bg-surface border border-border text-white rounded-xl px-4 py-2.5 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(job.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-[0.97]"
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-surface border border-border text-muted hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ---- VIEW MODE ---- */
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold text-lg truncate">{job.title}</h3>
                        <p className="text-muted text-sm mt-0.5">{job.companyName}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${STATUS_STYLES[job.Status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}
                      >
                        <span>{STATUS_ICONS[job.Status]}</span>
                        {job.Status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted">
                      {job.salary != null && (
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-400 font-medium">${job.salary.toLocaleString()}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📅 {new Date(job.DateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {job.Url && (
                        <a
                          href={job.Url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:text-primary-hover transition-colors"
                        >
                          🔗 Link
                        </a>
                      )}
                    </div>

                    {job.description && (
                      <p className="text-slate-400 text-sm mt-3 leading-relaxed">{job.description}</p>
                    )}

                    {/* Action buttons — visible on hover */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => startEditing(job)}
                        className="text-primary hover:text-primary-hover text-sm font-medium transition-colors cursor-pointer"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors cursor-pointer"
                      >
                        ✕ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
