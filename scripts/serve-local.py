#!/usr/bin/env python3
"""Static file server for local development, with caching switched off.

Why this exists rather than `python -m http.server`:

    http.server sends `Last-Modified` but no `Cache-Control`. With no explicit
    freshness, browsers fall back to heuristic caching (roughly 10% of the
    file's age) and will reuse a subresource for minutes without revalidating.
    While reviewing a change that produces a page built from a mix of fresh
    and stale files: the HTML updates, a JS module does not, and the result is
    a feature that renders but does not respond. That is a confusing way to
    lose an afternoon, and it is indistinguishable from a real bug.

    This server sends `Cache-Control: no-store` on everything, so a reload
    always reflects what is on disk.

    It matters more here than in most projects because the app registers a
    Service Worker. The worker is network-first, so it does not itself serve
    stale files, but its `fetch()` goes through the HTTP cache like any other,
    and the worker keeps running across reloads.

Usage:
    python scripts/serve-local.py [port]     (default 8000)
    npm run serve

Not for production. It is a review tool: no compression, no range requests
beyond what SimpleHTTPRequestHandler already does, and no security hardening
beyond binding to the loopback interface.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PORT = 8000
HOST = "127.0.0.1"


class NoCacheHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler that forbids caching of every response."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_response(self, code, message=None):
        """Drop the per-request log line down to one short line."""
        super().send_response(code, message)

    def log_message(self, fmt, *args):
        sys.stderr.write("  %s\n" % (fmt % args))


def main():
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Not a port number: {sys.argv[1]!r}", file=sys.stderr)
            return 2

    handler = partial(NoCacheHandler, directory=str(REPO_ROOT))
    try:
        server = ThreadingHTTPServer((HOST, port), handler)
    except OSError as err:
        print(f"Could not bind {HOST}:{port} ({err}).", file=sys.stderr)
        print("Another server is probably already using it; pass a different port.", file=sys.stderr)
        return 1

    print(f"Serving {REPO_ROOT} at http://{HOST}:{port}/  (caching disabled)")
    print("Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
