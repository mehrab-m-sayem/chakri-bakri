import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createJob } from '../api'

const STATUS_OPTIONS = ['pending', 'interview', 'offer', 'rejected', 'ghosted']

export default function AddJobPage() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '',
    companyName: '',
    salary: '',
    description: '',
    Url: '',
    Status: 'pending',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        title: form.title,
        companyName: form.companyName,
        description: form.description || undefined,
        Url: form.Url || undefined,
        Status: form.Status,
        salary: form.salary ? parseInt(form.salary) : undefined,
      }

      await createJob(payload, token)
      navigate('/jobs')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top nav bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/jobs" className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-medium">
            <span>←</span> Back to Jobs
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Add New Job</h1>
          <p className="text-muted mt-1">Fill in the details of the position you applied for.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-8 shadow-xl shadow-black/20 space-y-6"
        >
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Required fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Job Title *</label>
              <input
                id="job-title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Frontend Developer"
                className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Company Name *</label>
              <input
                id="job-company"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                required
                placeholder="e.g. Google"
                className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Salary</label>
              <input
                id="job-salary"
                name="salary"
                type="number"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 80000"
                className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted mb-1.5">Status</label>
              <select
                id="job-status"
                name="Status"
                value={form.Status}
                onChange={handleChange}
                className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Job Posting URL</label>
            <input
              id="job-url"
              name="Url"
              type="url"
              value={form.Url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-1.5">Description</label>
            <textarea
              id="job-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Any notes about this application..."
              className="w-full bg-surface border border-border text-white rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              id="job-submit"
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Job'
              )}
            </button>
            <Link
              to="/jobs"
              className="px-6 py-3 bg-surface border border-border text-muted hover:text-white rounded-xl transition-all font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
