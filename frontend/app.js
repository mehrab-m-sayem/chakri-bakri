const tabButtons = document.querySelectorAll('.tab')
const forms = document.querySelectorAll('.form')
const registerForm = document.getElementById('registerForm')
const loginForm = document.getElementById('loginForm')
const jobsForm = document.getElementById('jobsForm')
const messageBox = document.getElementById('message')
const tokenOutput = document.getElementById('tokenOutput')
const connectionLabel = document.getElementById('connectionLabel')
const connectionText = document.getElementById('connectionText')

const authContainer = document.getElementById('authContainer')
const dashboardContainer = document.getElementById('dashboardContainer')
const jobsList = document.getElementById('jobsList')
const logoutBtn = document.getElementById('logoutBtn')

const apiRoot = ''

function showMessage(text, type = 'success') {
    messageBox.textContent = text
    messageBox.className = `message show ${type}`
}

function setActiveTab(tabName) {
    tabButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tabName)
    })

    forms.forEach((form) => {
        const isActive = form.id === `${tabName}Form`
        form.classList.toggle('active', isActive)
    })
}

tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setActiveTab(button.dataset.tab)
        messageBox.className = 'message'
        messageBox.textContent = ''
    })
})

async function submitAuth(path, form) {
    const formData = new FormData(form)
    const payload = Object.fromEntries(formData.entries())

    const response = await fetch(`${apiRoot}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
        ? await response.json()
        : { message: await response.text() }

    if (!response.ok) {
        throw new Error(data.message || 'Request failed')
    }

    return data
}

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    try {
        connectionLabel.textContent = 'Registering...'
        connectionText.textContent = 'Sending your registration request to the auth backend.'

        const data = await submitAuth('/auth/register', registerForm)
        if (data.token) {
            localStorage.setItem('authToken', data.token)
            tokenOutput.textContent = data.token
            checkAuthAndLoadDashboard()
        }

        connectionLabel.textContent = 'Registered'
        connectionText.textContent = 'Account created successfully.'
        showMessage('Registration successful.', 'success')
    } catch (error) {
        connectionLabel.textContent = 'Register failed'
        connectionText.textContent = 'Check the backend logs and your form data.'
        showMessage(error.message, 'error')
    }
})

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    try {
        connectionLabel.textContent = 'Logging in...'
        connectionText.textContent = 'Checking your credentials.'

        const data = await submitAuth('/auth/login', loginForm)
        if (data.token) {
            localStorage.setItem('authToken', data.token)
            tokenOutput.textContent = data.token
            checkAuthAndLoadDashboard()
        }

        connectionLabel.textContent = 'Logged in'
        connectionText.textContent = 'Login succeeded.'
        showMessage('Login successful.', 'success')
    } catch (error) {
        connectionLabel.textContent = 'Login failed'
        connectionText.textContent = 'Check the backend logs and your credentials.'
        showMessage(error.message, 'error')
    }
})

if (jobsForm) {
    jobsForm.addEventListener('submit', async (event) => {
        event.preventDefault()
    
        try {
            connectionLabel.textContent = 'Adding Job...'
            connectionText.textContent = 'Sending your job data to the backend.'
    
            const formData = new FormData(jobsForm)
            const payload = Object.fromEntries(formData.entries())
            
            // Format numbers correctly
            if (payload.salary) {
                payload.salary = parseInt(payload.salary)
            }
    
            const token = localStorage.getItem('authToken')
            
            const response = await fetch('/jobs/addJob', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(payload)
            })
    
            const data = await response.json()
    
            if (!response.ok) {
                throw new Error(data.error || 'Request failed')
            }
    
            connectionLabel.textContent = 'Job Added'
            connectionText.textContent = 'Successfully saved your job!'
            showMessage('Job added successfully.', 'success')
            jobsForm.reset()
            fetchJobs() // Reload the list of jobs
        } catch (error) {
            connectionLabel.textContent = 'Add Job failed'
            connectionText.textContent = 'Ensure you are logged in and the backend is running.'
            showMessage(error.message, 'error')
        }
    })
}

async function fetchJobs() {
    try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        const response = await fetch('/jobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const jobs = await response.json()

        if (!response.ok) {
            throw new Error(jobs.error || 'Failed to fetch jobs')
        }

        jobsList.innerHTML = jobs.length === 0 
            ? '<p style="color: var(--muted);">No jobs added yet. Add one above!</p>' 
            : jobs.map(job => `
                <div class="card" style="padding: 15px; border-left: 4px solid var(--accent);">
                    <h3 style="margin: 0 0 5px 0;">${job.title} <span style="font-size: 0.8em; color: var(--muted);">at ${job.companyName}</span></h3>
                    <p style="margin: 5px 0; font-size: 0.9em;">Status: <strong>${job.Status}</strong> | Salary: $${job.salary || 'N/A'}</p>
                </div>
            `).join('')

    } catch (error) {
        console.error(error)
        jobsList.innerHTML = `<p style="color: var(--danger);">Failed to load jobs.</p>`
    }
}

function checkAuthAndLoadDashboard() {
    const token = localStorage.getItem('authToken')
    if (token) {
        tokenOutput.textContent = token
        authContainer.style.display = 'none'
        dashboardContainer.style.display = 'block'
        fetchJobs()
    } else {
        tokenOutput.textContent = 'No token yet'
        authContainer.style.display = 'block'
        dashboardContainer.style.display = 'none'
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken')
        messageBox.className = 'message'
        messageBox.textContent = ''
        connectionLabel.textContent = 'Ready'
        connectionText.textContent = 'Use the form on the right to create an account or sign in.'
        checkAuthAndLoadDashboard()
    })
}

// Initial check on page load
checkAuthAndLoadDashboard()