const tabButtons = document.querySelectorAll('.tab')
const forms = document.querySelectorAll('.form')
const registerForm = document.getElementById('registerForm')
const loginForm = document.getElementById('loginForm')
const messageBox = document.getElementById('message')
const tokenOutput = document.getElementById('tokenOutput')
const connectionLabel = document.getElementById('connectionLabel')
const connectionText = document.getElementById('connectionText')

const apiRoot = '/auth'

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

        const data = await submitAuth('/register', registerForm)
        if (data.token) {
            localStorage.setItem('authToken', data.token)
            tokenOutput.textContent = data.token
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

        const data = await submitAuth('/login', loginForm)
        if (data.token) {
            localStorage.setItem('authToken', data.token)
            tokenOutput.textContent = data.token
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

const savedToken = localStorage.getItem('authToken')
if (savedToken) {
    tokenOutput.textContent = savedToken
}