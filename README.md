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

## Middleware and Order

The order in `server.js` is:

1. `logger` – prints `[timestamp] METHOD URL` for every request, then calls `next()`.
2. `requestCounter` – adds 1 to `requestsServed`, then calls `next()`.
3. `express.static(public/)` – serves `index.html`, `styles.css` and `app.js`.
4. The routes (`/hello`, `/robots.txt`, `/old-page`, `/api/...`).
5. The 404 fallback – a path-less `app.use()` registered last.

**Why this order:** Express runs middleware and routes from top to bottom. The logger is first so that every request is printed, even ones that end in a 404. The counter is second so it also sees every request. The static files come before the routes so the page loads without going through any route. The 404 fallback is last because it matches every request; anywhere higher, it would hide the real routes (see Reasoning Question 1).

**Which requests are counted:** every request that reaches the server, because the counter runs before anything that can send a response. This includes:

- API requests, including `/api/stats` itself (the number shown already includes the request that asked for it),
- the static files of the page (`/`, `/styles.css`, `/app.js`),
- 404 responses, including `/favicon.ico`, which the browser requests automatically.

I chose this because the counter is meant to show how many requests the server has *served* in total, and a 404 or a CSS file is still work the server did. The counter lives only in memory, so it starts again at 0 whenever the server restarts.

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

## Reasoning Questions

### 1. Route order

**Experiment:** I moved the 404 fallback from the bottom of `server.js` to just after the two middleware functions, above `express.static` and all routes. After that, every request got a 404: `/` showed `404 - Page not found` instead of the page, `/hello` also showed `404 - Page not found`, and `/api/courses` returned `{"error":"Not found"}`. The logger still printed every request, because it is registered above the fallback.

**Why:** Express checks middleware and routes in the order they are registered. A path-less `app.use()` matches every request, and the fallback sends a response without calling `next()`, so nothing below it ever runs. That is why it has to be registered last. After the experiment I moved it back to the bottom.

### 2. Middleware

**Experiment:** I commented out `next()` in the logger. When I opened `/hello` in the browser, the tab kept loading forever and the page never appeared. The server terminal still printed `[...] GET /hello` for every attempt. With `curl.exe --include --max-time 10 http://localhost:3000/api/courses` I got `curl: (28) Operation timed out after 10009 milliseconds with 0 bytes received`.

**Why:** The logger neither sent a response nor called `next()`, so the request stopped there. The counter, the static files and the routes were never reached, and the client waited for an answer that never came. Every middleware must either finish the response or pass control on with `next()`. After the experiment I put `next()` back.

### 3. Status codes

`201 Created` tells the client that the request did more than succeed: it created something new, here a subscription. `200 OK` only means "it worked", so `201` describes the result more precisely. A missing page must be `404` because programs read the status code, not the text. With `200` plus an error message, `fetch` would report `response.ok === true` (my page would show it in green), browsers and search engines would treat the error page as real content, and tools like `curl` scripts could not tell that something went wrong.

### 4. Configuration

The port depends on where the server runs, not on the code. Hosting platforms usually decide the port themselves and pass it in the `PORT` environment variable, and on my own computer port 3000 might already be used by another program. Reading `process.env.PORT` lets the same code run anywhere without editing it, and the fallback `3000` keeps local development simple.

### 5. Dependencies

`node_modules` is not committed because it is very large, it is generated automatically, and it can contain files that are specific to one operating system. Everything needed to rebuild it is already in `package.json` and `package-lock.json`. After cloning the repository, a teammate must run `npm install` in the project folder (this installs the exact versions from `package-lock.json`) and then start the server with `npm start` or `npm run dev`.

### 6. Same origin

If `index.html` were opened directly from disk, its address would be `file:///C:/.../index.html`, so a relative URL like `/api/courses` would point to a file on the disk instead of the server, and the requests would fail. Even if I changed the URLs to `http://localhost:3000/api/...`, the page (`file://`) and the API (`http://localhost:3000`) would have different origins, and the browser would block reading the responses. This restriction is called the **same-origin policy**; the server could only allow it with CORS headers. Serving the page from the same server avoids the problem, because the page and the API share one origin.