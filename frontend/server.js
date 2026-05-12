import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const frontendPort = 3000
const backendPort = 5003
const publicDir = path.join(process.cwd(), 'frontend')

function getContentType(filePath) {
    if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
    if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
    if (filePath.endsWith('.js')) return 'application/javascript; charset=utf-8'
    return 'text/plain; charset=utf-8'
}

function serveFile(res, filePath) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
            res.end('Not found')
            return
        }

        res.writeHead(200, { 'Content-Type': getContentType(filePath) })
        res.end(data)
    })
}

function proxyAuth(req, res) {
    const proxyRequest = http.request(
        {
            hostname: 'localhost',
            port: backendPort,
            path: req.url,
            method: req.method,
            headers: {
                ...req.headers,
                host: `localhost:${backendPort}`
            }
        },
        (proxyResponse) => {
            res.writeHead(proxyResponse.statusCode || 500, proxyResponse.headers)
            proxyResponse.pipe(res)
        }
    )

    proxyRequest.on('error', () => {
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ message: 'Backend is not running on port 5003' }))
    })

    req.pipe(proxyRequest)
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/auth/') || req.url.startsWith('/jobs/')) {
        proxyAuth(req, res)
        return
    }

    if (req.url === '/' || req.url === '/index.html') {
        serveFile(res, path.join(publicDir, 'index.html'))
        return
    }

    if (req.url === '/styles.css') {
        serveFile(res, path.join(publicDir, 'styles.css'))
        return
    }

    if (req.url === '/app.js') {
        serveFile(res, path.join(publicDir, 'app.js'))
        return
    }

    serveFile(res, path.join(publicDir, 'index.html'))
})

server.listen(frontendPort, () => {
    console.log(`Frontend running on http://localhost:${frontendPort}`)
})