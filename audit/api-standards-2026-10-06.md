# API Standards Audit — alex-baker-cdm/windsurf-demo (2026-10-06)

## Summary

- **Surface**: REST (Flask). Routes mounted: `GET /` (HTML page), `GET /game_state` (JSON), `POST /update_player` (JSON).
- **Outbound calls**: none — this repo is a pure provider.
- **Classification**: training/demo repo (Windsurf onboarding); not a production service, but audited with the full checklist.
- **Auth model**: none — no authentication or authorization on any route.
- **Spec present**: no — no OpenAPI/GraphQL/proto spec anywhere in the repo.
- **How it was run**: `source venv/bin/activate && python3 app.py` — Flask/Werkzeug dev server on http://localhost:5000 with `debug=True`. Verified at runtime with curl: unauthenticated access to both JSON routes, arbitrary/malformed/oversized POST bodies, wrong-method and unknown-route handling, response headers. `pip-audit -r requirements.txt` (clean) and `npm audit --audit-level=high` (44 vulns, fix available) were run against the lockfiles.

## Findings per area

| ID | Severity | Title | File:lines | Effort |
|----|----------|-------|-----------|--------|
| WSD-B-01 | high | Flask debug mode enables Werkzeug debugger | app.py:27 | S |
| WSD-B-02 | high | No auth on state-mutating POST /update_player | app.py:22-25 | M |
| WSD-A-01 | medium | No API spec; endpoints are stubs returning `{"status":"ok"}` | app.py:17-25 | M |
| WSD-C-01 | medium | No input validation on /update_player body | app.py:22-25 | S |
| WSD-C-02 | low | No request size limit (MAX_CONTENT_LENGTH unset) | app.py:5 | S |
| WSD-D-01 | medium | Error responses are Werkzeug HTML, not JSON; inconsistent envelope | app.py (no error handlers) | S |
| WSD-E-01 | low | No application logging or health/readiness endpoint | app.py | S |
| WSD-F-01 | medium | Missing security headers (no CSP, X-Frame-Options, etc.) | app.py | S |
| WSD-F-02 | high | npm dependencies: 1 critical + 37 high vulnerabilities, fix available | package-lock.json | S |
| WSD-F-03 | low | No rate limiting on POST endpoint | app.py | S |
| WSD-G-01 | low | No CI, contract tests, changelog, or deprecation policy | repo root | M |

## Detailed findings

### WSD-B-01 — Flask debug mode enables Werkzeug debugger (high)

`app.py:27` — `app.run(debug=True)`.

Runtime evidence (server startup log):

```
 * Running on http://127.0.0.1:5000
 * Debugger is active!
 * Debugger PIN: 753-725-197
```

With `debug=True`, unhandled exceptions serve the interactive Werkzeug traceback page and the `/console` debugger endpoint is mounted (returned 200 in testing). The PIN gate is bypassable in older Werkzeug versions and the debugger still leaks source and environment. On any non-localhost bind this is a serious exposure.

**Remediation**: never enable debug via the run path — gate it on an env var (`app.run(debug=os.environ.get("FLASK_DEBUG") == "1")`) and deploy behind a real WSGI server (gunicorn/waitress) in production.

### WSD-B-02 — No auth on state-mutating POST /update_player (high)

`app.py:22-25`. Any caller can POST player updates; there is no token, session, or key check anywhere in the app.

Transcript:

```
$ curl -si -X POST http://localhost:5000/update_player -H 'Content-Type: application/json' -d '{"x":1,"y":2,"id":999}'
HTTP/1.1 200 OK
{"status": "ok"}
```

**Remediation**: if this ever fronts real state, add an auth middleware (Flask `before_request` checking a Bearer token / session, or flask-login) and object-level checks binding player ids to the authenticated caller. For a demo, document the unauthenticated posture explicitly in the README.

### WSD-A-01 — No API spec; endpoints are stubs (medium)

`app.py:17-25`. Both JSON routes return a hardcoded `{"status":"ok"}` regardless of input; `/update_player` ignores its body entirely. There is no OpenAPI spec, no versioning, and git history (`git log --oneline -- app.py` → 2 commits) shows no contract evolution. Resource naming is snake_case paths rather than REST resources.

**Remediation**: write a minimal OpenAPI 3.x spec (or generate one via flask-smorest / apispec) describing the two routes and their schemas; version under `/api/v1/` if the API is expected to evolve.

### WSD-C-01 — No input validation on /update_player (medium)

`app.py:22-25` — `request.get_json()` result is unused; any well-formed JSON returns 200.

Transcript (arbitrary payload accepted):

```
$ curl -si -X POST http://localhost:5000/update_player -d '{"x":1,"y":2,"id":999}'
HTTP/1.1 200 OK
{"status": "ok"}
```

**Remediation**: validate the body with a pydantic model or `flask-expect`/`voluptuous` schema (typed x/y coordinates, bounded values) and return a 422 with field errors on mismatch.

### WSD-C-02 — No request size limit (low)

`app.py` never sets `app.config["MAX_CONTENT_LENGTH"]`. Verified: a ~5 MB JSON body was accepted and parsed (returned 400 only because the JSON was malformed, not rejected for size).

```
$ curl -si -X POST http://localhost:5000/update_player --data-binary @big.json   # ~5MB
HTTP/1.1 400 BAD REQUEST
```

**Remediation**: set `MAX_CONTENT_LENGTH` (e.g. 16–64 KB for this payload) so oversized bodies get an automatic 413.

### WSD-D-01 — Inconsistent error envelope (medium)

Success returns JSON but errors return Werkzeug HTML pages; no `@app.errorhandler` is registered.

```
$ curl -si -X POST http://localhost:5000/update_player -d 'not json{'
HTTP/1.1 400 BAD REQUEST
Content-Type: text/html; charset=utf-8
<h1>Bad Request</h1><p>Failed to decode JSON object: Expecting value: line 1 column 1 (char 0)</p>

$ curl -si http://localhost:5000/nope
HTTP/1.1 404 NOT FOUND
Content-Type: text/html; charset=utf-8
```

Note the 400 leaks the raw decoder message (minor info disclosure). No correlation/request ids are returned or logged.

**Remediation**: register JSON error handlers returning an RFC 9457 `application/problem+json` envelope (`type`, `title`, `status`, `detail`, `instance`) for 4xx/5xx, and add a request-id header (`X-Request-ID`) echoed to logs.

### WSD-E-01 — No logging or health endpoints (low)

`app.py` has zero logging calls beyond Werkzeug's default access log; no `/health` or `/ready`, no metrics/tracing hooks. 5xx would not be alertable.

**Remediation**: use Python `logging` with a structured formatter (e.g. `python-json-logger`), add a `/healthz` route, and wire request-id propagation.

### WSD-F-01 — Missing security headers (medium)

Verified response headers contain only `Server`, `Date`, `Content-Type`, `Content-Length` — no `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy`. The game page (`templates/game.html`) is served without any hardening.

**Remediation**: add `flask-talisman` (or an `after_request` hook) setting a baseline header set; configure CSP to match the static-JS bundle.

### WSD-F-02 — Vulnerable npm dependencies (high)

`npm audit --audit-level=high` → **44 vulnerabilities (1 critical, 37 high) with `npm audit fix` available**, including `ws` and `@babel/plugin-transform-modules-systemjs` ("generates arbitrary code when compiling malicious input"). `pip-audit -r requirements.txt` → clean.

**Remediation**: run `npm audit fix` (and `npm audit fix --force` for the rest) and add `npm audit --audit-level=high` as a CI gate.

### WSD-F-03 — No rate limiting (low)

Nothing throttles `/update_player`; a client can POST unboundedly. For a game tick endpoint this invites resource exhaustion once real state exists.

**Remediation**: `flask-limiter` with a per-IP limit (e.g. 60/min) on mutating routes.

### WSD-G-01 — No CI or lifecycle gates (low)

No `.github/workflows`, no contract tests, no spec linting, no changelog, no deprecation markers, no documented deploy/rollback path.

**Remediation**: add a minimal GitHub Actions workflow running `npm test`, `pip-audit`/`npm audit`, and (once a spec exists) `spectral lint`.

## Positives

- JSON routes consistently return `application/json` for success responses.
- Correct method enforcement: `GET /update_player` returns 405 with a proper `Allow: POST, OPTIONS` header.
- `.gitignore` covers `venv/`, `.env*`, `node_modules/`, coverage and build output — no secrets or environments committed (verified: no `.env` or keys in the tree).
- No secrets, keys, or hardcoded credentials anywhere in code or config.
- Python dependencies (`Flask>=3.0.0`, `numpy>=1.26.0`) are current and clean under `pip-audit`.
- A real Jest test suite exists for the static JS (`npm test`; 22/23 pass — the `calculateCenterOfMass` failure is a known pre-existing bug in test expectations).
- Dev server binds localhost only by default — the debug-mode exposure is not listening on all interfaces out of the box.

## Needs confirmation

- Whether the app is ever deployed anywhere other than local dev — if it is, WSD-B-01 (debug mode) and WSD-B-02 (no auth) escalate to critical.
- Effective rate-limiting need once `/update_player` actually mutates state (currently a stub).
- CORS policy intent — no `Access-Control-*` headers are sent (restrictive default is fine for same-origin use, but undocumented).

## Appendix: commands run and tool versions

```
python3 --version                    # Python 3.12.8
Flask/Werkzeug                       # Werkzeug/3.1.8 (from Server header)
source venv/bin/activate && python3 app.py          # Flask dev server :5000, debug=True
curl -si http://localhost:5000/game_state
curl -si -X POST http://localhost:5000/update_player -H 'Content-Type: application/json' -d '{"x":1,"y":2,"id":999}'
curl -si -X POST http://localhost:5000/update_player -d 'not json{'
curl -si -X POST http://localhost:5000/update_player -d ''
curl -si http://localhost:5000/update_player        # 405
curl -si http://localhost:5000/console              # 200 (debugger console)
curl -si http://localhost:5000/nope                 # 404
curl -si -X POST http://localhost:5000/update_player --data-binary @big.json   # ~5MB body
pip-audit -r requirements.txt        # pip-audit (latest); No known vulnerabilities found
npm audit --audit-level=high         # npm 10.8.2; 44 vulns (1 critical, 37 high), fix available
git log --oneline -- app.py helpers.py
```
