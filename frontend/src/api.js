// ============================================================
// api.js — THE BRIDGE BETWEEN FRONTEND AND BACKEND
// ============================================================
// Every function in this file makes an HTTP request to one of
// your Express backend routes using the browser's fetch() API.
//
// This is the ONLY file that talks to your backend.
// All other files (pages, components) call these functions.
// ============================================================

// ---------- AUTH ROUTES (no token needed) ----------

// Calls: POST /auth/register
// Your backend route: authRoutes.js → router.post('/register')
// Sends: { username, email, password }
// Returns: { token } (a JWT)
export async function registerUser(username, email, password) {
  const response = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  const data = await response.json()

  // If backend returned an error status (400, 503, etc.), throw it
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed')
  }

  return data // { token: "eyJhbGciOiJ..." }
}

// Calls: POST /auth/login
// Your backend route: authRoutes.js → router.post('/login')
// Sends: { username, password }
// Returns: { token }
export async function loginUser(username, password) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data // { token: "eyJhbGciOiJ..." }
}

// ---------- JOB ROUTES (token required) ----------
// These routes are protected by your authMiddleware.js.
// Every request must include the JWT in the Authorization header.
// Your middleware reads it like this:
//   const token = req.headers.authorization.slice(7) // removes "Bearer "
//   jwt.verify(token, secret) → sets req.userId

// Calls: GET /jobs
// Your backend route: jobRoutes.js → router.get('/')
// Returns: Array of job objects for the logged-in user
export async function getJobs(token) {
  const response = await fetch('/jobs', {
    headers: {
      // This is how the frontend sends the JWT to the backend.
      // Your authMiddleware reads this header and extracts the user ID.
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch jobs')
  }

  return data // [{ id, title, companyName, Status, salary, ... }, ...]
}

// Calls: POST /jobs/addJob
// Your backend route: jobRoutes.js → router.post('/addJob')
// Sends: { title, companyName, salary?, description?, Url?, Status? }
// Returns: The newly created job object
export async function createJob(jobData, token) {
  const response = await fetch('/jobs/addJob', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add job')
  }

  return data // { id, title, companyName, ... }
}

// Calls: PUT /jobs/:id
// Your backend route: jobRoutes.js → router.put('/:id')
// Sends: { title, companyName, salary?, description?, Url?, Status? }
// Returns: The updated job object
export async function updateJob(id, jobData, token) {
  const response = await fetch(`/jobs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update job')
  }

  return data
}

// Calls: DELETE /jobs/:id
// Your backend route: jobRoutes.js → router.delete('/:id')
// Returns: { message: "Successfully deleted" }
export async function deleteJob(id, token) {
  const response = await fetch(`/jobs/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Failed to delete job')
  }

  return data
}
