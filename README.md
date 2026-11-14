# Assignment 8 – Study Programme Info Server

A small Node.js and Express 5 server for a made-up Computer Engineering study programme. It serves a web page from `public/`, offers several routes that return text, JSON, errors and a redirect, logs every request and counts how many requests it has served since it started.

## How to Install and Run

Requirements: Node.js (LTS) and npm.

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

- `npm start` runs the server with `node server.js`.
- `npm run dev` runs it with `node --watch server.js`, so it restarts automatically when a file changes.
- The port can be changed with the `PORT` environment variable, for example in PowerShell: `$env:PORT=4000; npm start`. Without it the server uses `3000`.

## File Organization

```
/assignment8
├── public/
│   ├── index.html      # Programme page with one button per API route
│   ├── styles.css      # Minimal styles
│   └── app.js          # Calls the API with fetch() and shows status + body
├── server.js           # Express app: data, middleware, routes, 404 fallback
├── package.json        # "type": "module", start/dev scripts, express dependency
├── package-lock.json   # Exact dependency versions
├── .gitignore          # node_modules/ and .env
└── README.md
```

## Routes

| Method and path | Response |
|---|---|
| `GET /` | `public/index.html` (served by `express.static`) |
| `GET /hello` | `200`, plain text: `Hello from Eylül Yerli's server` |
| `GET /robots.txt` | `200`, plain text (`text/plain`) |
| `GET /old-page` | `301` redirect to `/hello` |
| `GET /api/courses` | `200`, JSON array of 3 courses |
| `GET /api/status` | `200`, `{ status, nodeVersion, uptimeSeconds }` |
| `GET /api/headers` | `200`, `{ userAgent, accept }` from the request |
| `POST /api/subscribe` | `201`, `{ "subscribed": true }` |
| `GET /api/admin` | `403`, `{ "error": "Forbidden" }` |
| `GET /api/stats` | `200`, `{ "requestsServed": <number> }` |
| anything else | `404`, JSON for `/api/...` paths, plain text otherwise |

## Testing Evidence

All outputs below were captured with `curl.exe --include` in PowerShell (`curl.exe` is used because `curl` is an alias for a different command in PowerShell).

### 1. Successful JSON response – `GET /api/courses`

```
> curl.exe --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 158
ETag: W/"9e-grrFvVx9Lncy6lh6JBcAYPpnptc"
Date: Sat, 14 Nov 2026 20:30:37 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Introduction to Programming","credits":6},{"id":2,"title":"Web Programming","credits":5},{"id":3,"title":"Database Management","credits":5}]
```

### 2. 201 response – `POST /api/subscribe`

```
> curl.exe --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Sat, 14 Nov 2026 20:31:04 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. 403 response – `GET /api/admin`

```
> curl.exe --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Sat, 14 Nov 2026 20:31:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. Redirect – `GET /old-page`

```
> curl.exe --include http://localhost:3000/old-page
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 40
Date: Sat, 14 Nov 2026 20:31:34 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to /hello
```

### 5. 404 on an `/api` path – `GET /api/does-not-exist`

```
> curl.exe --include http://localhost:3000/api/does-not-exist
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Sat, 14 Nov 2026 20:31:56 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. 404 on a non-API path – `GET /does-not-exist`

```
> curl.exe --include http://localhost:3000/does-not-exist
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 20
ETag: W/"14-uqvetqrE8oeY4r2Xn8/CTahXnYE"
Date: Sat, 14 Nov 2026 20:32:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5

404 - Page not found
```