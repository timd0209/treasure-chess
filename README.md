# Treasure Chess

**Author: Tim Donnelly**

Treasure Chess is a browser-based chess game with a classic chess feel and a light pirate/treasure theme. It will run on Cloudflare Workers and use only plain HTML, CSS, and JavaScript.

## Project Goal

Build a complete chess game that works in three modes:

1. **HOT-SEAT** — two people share one screen and take turns.
2. **VS COMPUTER** — the human plays one side and the browser controls the other.
3. **ONLINE** — two people enter the same room code on separate devices and see each other's moves live.

The visual style should stay simple: traditional chessboard readability first, with restrained treasure-map, wood, brass, gold, rope, or pirate-inspired details.

## What “Complete Chess” Means

The rules engine must support all six chess pieces, normal legal moves, captures, check, checkmate, stalemate, castling, en passant, and pawn promotion with a choice of queen, rook, bishop, or knight. An illegal move must never be allowed.

Before the interface is built, the chess rules must pass a **move-count test**, also called a *perft test*. A perft test counts every legal move sequence to a specified depth from a known position. From the normal starting position, Treasure Chess must produce exactly:

- Depth 1: **20**
- Depth 2: **400**
- Depth 3: **8,902**

If those numbers do not match, the rules are not considered ready.

## Plain-English Architecture

A **Cloudflare Worker** is server-side JavaScript that runs on Cloudflare's network instead of on a traditional server. It will serve the site and handle online-game requests.

A **static asset** is a file sent directly to the browser, such as HTML, CSS, JavaScript, or an image. Treasure Chess will publish the browser files through the Worker project's `assets` configuration.

A **WebSocket** is a long-lived connection between a browser and the server that lets both sides send updates immediately. Online rooms will use native WebSockets so moves appear live without repeated page refreshes.

A **Durable Object** is a Cloudflare server component that gives one logical object a consistent home for state and requests. Treasure Chess will use one Durable Object per room so every player in that room talks to the same authority.

**SQLite** is a small relational database built into each Durable Object. The current game position will be saved after every accepted move so no timer or periodic save process is needed.

A **server-authoritative game** means the browser proposes a move, but the server makes the final decision about whether the move is legal and what the official position becomes. Online mode will use this model so two devices cannot disagree about the game.

A **room code** is the shared text identifier players type to join the same online game. The Worker will resolve a room with `env.ROOM.getByName(roomCode)`.

A **serialized attachment** is small identity data stored with a WebSocket connection. Online mode will use `ws.serializeAttachment()` so the Durable Object knows whether a connection is White, Black, or a spectator.

**Minimax** is a search method that assumes both sides choose the best move they can find. **Alpha-beta pruning** is an optimization that skips branches of the search tree that cannot affect the final choice. The computer player will run entirely in the browser at search depth 2.

## Technical Rules

The following constraints are fixed for this project:

- Cloudflare Workers Free plan.
- Static site served through `assets` in `wrangler.jsonc`.
- `not_found_handling` set to `single-page-application`.
- `run_worker_first` configured for the WebSocket route.
- `compatibility_date` set to **2026-09-15**.
- Observability enabled.
- All chess rules written by us in one shared module: `rules.js`.
- No `chess.js` or other chess engine library.
- No React.
- No Socket.IO, Express, or `ws` package.
- Native WebSockets accepted with `ctx.acceptWebSocket()`.
- WebSocket messages use JSON objects with `type` and `payload`.
- One SQLite-backed Durable Object per room.
- Durable Object migration uses `new_sqlite_classes`.
- Game state saved after every move.
- No timers of any kind.

## Out of Scope

Treasure Chess will not include accounts, logins, chess clocks, ratings, threefold-repetition draws, fifty-move-rule draws, opening books, or move export.

## Delivery Order

The required implementation sequence is:

1. Prove the shared chess rules are correct.
2. Put HOT-SEAT online as the first playable release.
3. Add VS COMPUTER.
4. Add ONLINE rooms.
5. Build optional extras last: move sound and online resign.

Detailed dependencies, files, and definitions of done are maintained in `FEATUREROADMAP_workplan.md`.
