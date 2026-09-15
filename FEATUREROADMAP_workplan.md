# Treasure Chess — Feature Roadmap & Workplan

**Owner: Tim Donnelly**

This file is the build order. Each checkbox is one task. Do not skip dependencies. A task is only complete when its definition of done is true.

## Terms used in this plan

A **dependency** is work that must be finished before another task can safely begin.

A **definition of done** is the exact condition that proves a task is complete.

A **deployment** is publishing the current project to Cloudflare so it is reachable on the internet.

A **pull request (PR)** is a GitHub proposal that groups commits for review before they are merged into the main branch.

---

# Phase 0 — Project Setup and Rule Proof

- [ ] **Task 0.1 — Create the Cloudflare Worker project shell**
  - **Depends on:** none
  - **Files:** `package.json`, `wrangler.jsonc`, `src/worker.js`, `public/index.html`, `public/styles.css`, `public/app.js`
  - **Work:** Configure Cloudflare Workers Free-plan deployment, static assets, `not_found_handling: "single-page-application"`, WebSocket `run_worker_first` routing, `compatibility_date: "2026-09-15"`, and observability.
  - **Definition of done:** The empty Treasure Chess shell deploys successfully to Cloudflare and the public URL loads without errors.

- [ ] **Task 0.2 — Build the shared chess state model in `rules.js`**
  - **Depends on:** Task 0.1
  - **Files:** `public/rules.js`
  - **Work:** Represent the board, side to move, castling rights, en-passant target, and game state in one reusable structure.
  - **Definition of done:** A standard starting position can be created, copied, and read by both browser code and Worker-side code without any duplicate rules implementation.

- [ ] **Task 0.3 — Implement basic piece movement and captures**
  - **Depends on:** Task 0.2
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Implement legal movement patterns for pawns, knights, bishops, rooks, queens, and kings, including normal captures and board boundaries.
  - **Definition of done:** The move generator produces only geometrically valid candidate moves for all six piece types from test positions.

- [ ] **Task 0.4 — Implement check detection and legal-move filtering**
  - **Depends on:** Task 0.3
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Detect attacked kings and remove any move that would leave the moving side's king in check.
  - **Definition of done:** Moves that expose or leave the player's king in check are never returned as legal moves.

- [ ] **Task 0.5 — Implement castling**
  - **Depends on:** Task 0.4
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Support kingside and queenside castling, including empty-path, check, attacked-square, king-moved, and rook-moved restrictions.
  - **Definition of done:** Castling is legal only when every normal chess requirement is satisfied, and castling rights are removed correctly after king or rook movement.

- [ ] **Task 0.6 — Implement en passant**
  - **Depends on:** Task 0.4
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Track the en-passant target after a two-square pawn advance and allow the special capture only on the immediately following move.
  - **Definition of done:** En passant appears only in legal positions, removes the correct pawn, and expires after one opposing turn.

- [ ] **Task 0.7 — Implement pawn promotion choices**
  - **Depends on:** Task 0.3
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Generate promotion moves to queen, rook, bishop, or knight for both quiet moves and captures.
  - **Definition of done:** Every legal promotion has exactly the four allowed piece choices and updates the board correctly.

- [ ] **Task 0.8 — Implement checkmate and stalemate detection**
  - **Depends on:** Tasks 0.4, 0.5, 0.6, 0.7
  - **Files:** `public/rules.js`, `test/perft.test.js`
  - **Work:** Detect when the side to move has no legal moves and distinguish checkmate from stalemate.
  - **Definition of done:** Known checkmate positions report checkmate, known stalemate positions report stalemate, and ordinary positions report neither.

- [ ] **Task 0.9 — Pass the required move-count test**
  - **Depends on:** Tasks 0.3 through 0.8
  - **Files:** `test/perft.test.js`, `public/rules.js`
  - **Work:** Run a recursive legal-move count from the standard starting position and fix all rule bugs before continuing.
  - **Definition of done:** Exact results are **depth 1 = 20, depth 2 = 400, depth 3 = 8,902**. No game interface work starts until all three pass.

---

# Phase 1 — HOT-SEAT, Live on the Internet First

- [ ] **Task 1.1 — Build the Treasure Chess visual shell**
  - **Depends on:** Task 0.9
  - **Files:** `public/index.html`, `public/styles.css`, `public/app.js`
  - **Work:** Match the project's Figma layout and create the simple pirate/treasure look: classic readable chessboard, restrained gold/brown/wood/parchment styling, mode controls, game-status area, and New Game button.
  - **Definition of done:** The page visually matches the intended design closely, stays readable, and works on desktop and mobile widths.

- [ ] **Task 1.2 — Render the board and pieces from shared game state**
  - **Depends on:** Tasks 0.9 and 1.1
  - **Files:** `public/app.js`, `public/styles.css`, `public/rules.js`
  - **Work:** Draw all 64 squares and all pieces based on the current `rules.js` state rather than hard-coding the starting board into the interface.
  - **Definition of done:** Resetting the game state re-renders the standard chess position correctly and board orientation is consistent.

- [ ] **Task 1.3 — Add legal move interaction for HOT-SEAT**
  - **Depends on:** Task 1.2
  - **Files:** `public/hotseat.js`, `public/app.js`, `public/styles.css`, `public/rules.js`
  - **Work:** Let players select a piece, show legal destinations, complete only legal moves, alternate turns, and show last-move/selection feedback.
  - **Definition of done:** Two people can play ordinary legal chess on one screen and no illegal move can be completed.

- [ ] **Task 1.4 — Add promotion UI and end-of-game messages**
  - **Depends on:** Task 1.3
  - **Files:** `public/hotseat.js`, `public/app.js`, `public/styles.css`
  - **Work:** Show queen/rook/bishop/knight choices when promotion is required and clearly announce check, checkmate, or stalemate.
  - **Definition of done:** Promotion cannot complete until a legal piece is chosen, and checkmate/stalemate visibly end the game.

- [ ] **Task 1.5 — Add HOT-SEAT New Game**
  - **Depends on:** Task 1.4
  - **Files:** `public/hotseat.js`, `public/app.js`
  - **Work:** Reset the local position, turn, selections, promotion state, and result state.
  - **Definition of done:** Clicking New Game always returns HOT-SEAT to a clean standard starting position.

- [ ] **Task 1.6 — Deploy and verify HOT-SEAT publicly**
  - **Depends on:** Tasks 1.1 through 1.5
  - **Files:** project deployment configuration and all Phase 1 files
  - **Work:** Publish to Cloudflare and manually verify legal moves, castling, en passant, promotion, checkmate, stalemate, mobile layout, and New Game on the internet.
  - **Definition of done:** HOT-SEAT is fully playable at the public Cloudflare URL. **Do not begin VS COMPUTER before this task is done.**

---

# Phase 2 — VS COMPUTER

- [ ] **Task 2.1 — Add computer-mode selection and side behavior**
  - **Depends on:** Task 1.6
  - **Files:** `public/app.js`, `public/computer.js`, `public/index.html`, `public/styles.css`
  - **Work:** Add VS COMPUTER mode and make the human side visually use the Gold/Brown theme while the browser controls the opponent.
  - **Definition of done:** Starting VS COMPUTER creates a valid standard game and clearly identifies the human and computer sides.

- [ ] **Task 2.2 — Build the position evaluation function**
  - **Depends on:** Task 2.1
  - **Files:** `public/computer.js`
  - **Work:** Score a position using simple, explainable chess values, primarily material values for each piece.
  - **Definition of done:** Clearly winning material gives the winning side a better score, and checkmate receives a decisive score.

- [ ] **Task 2.3 — Implement minimax at depth 2**
  - **Depends on:** Task 2.2
  - **Files:** `public/computer.js`, `public/rules.js`
  - **Work:** Search legal move sequences two layers deep using only legal moves returned by the shared rules module.
  - **Definition of done:** For every normal computer turn, the algorithm returns one move from the legal-move list.

- [ ] **Task 2.4 — Add alpha-beta pruning**
  - **Depends on:** Task 2.3
  - **Files:** `public/computer.js`
  - **Work:** Skip search branches that cannot change the selected result while preserving the same best-move outcome.
  - **Definition of done:** The browser still chooses legal depth-2 moves and search completes within two seconds under normal supported-device conditions.

- [ ] **Task 2.5 — Integrate computer turns with all special chess rules**
  - **Depends on:** Task 2.4
  - **Files:** `public/computer.js`, `public/app.js`, `public/rules.js`
  - **Work:** Make computer turns flow through the same move application path as human turns, including castling, en passant, promotion, checkmate, and stalemate.
  - **Definition of done:** A full game can be played against the browser without any special rule bypass or illegal computer move.

- [ ] **Task 2.6 — Add VS COMPUTER New Game and regression test**
  - **Depends on:** Task 2.5
  - **Files:** `public/computer.js`, `public/app.js`, `test/perft.test.js`
  - **Work:** Reset the mode cleanly and rerun rule proof after computer-mode integration.
  - **Definition of done:** New Game resets correctly and perft still returns 20 / 400 / 8,902.

- [ ] **Task 2.7 — Deploy and verify VS COMPUTER publicly**
  - **Depends on:** Task 2.6
  - **Files:** all Phase 2 files
  - **Work:** Publish and test repeated games against the browser.
  - **Definition of done:** The public site supports HOT-SEAT and VS COMPUTER, the computer always makes legal moves, and normal responses remain under two seconds.

---

# Phase 3 — ONLINE Rooms

- [ ] **Task 3.1 — Add Durable Object configuration**
  - **Depends on:** Task 2.7
  - **Files:** `wrangler.jsonc`, `src/room.js`, `src/worker.js`
  - **Work:** Add the `ROOM` Durable Object binding, SQLite-backed class, and migration using `new_sqlite_classes`.
  - **Definition of done:** Cloudflare accepts the configuration and a room object can be addressed with `env.ROOM.getByName(roomCode)`.

- [ ] **Task 3.2 — Add the native WebSocket route**
  - **Depends on:** Task 3.1
  - **Files:** `src/worker.js`, `src/room.js`, `wrangler.jsonc`
  - **Work:** Route the chosen WebSocket path through Worker code first and accept connections using `ctx.acceptWebSocket()` with no Socket.IO, Express, or `ws` package.
  - **Definition of done:** A browser can establish a native WebSocket connection to a named room Durable Object.

- [ ] **Task 3.3 — Define and implement the JSON message protocol**
  - **Depends on:** Task 3.2
  - **Files:** `src/room.js`, `public/online.js`
  - **Work:** Use JSON messages with top-level `type` and `payload` fields for initial state, move attempts, accepted state updates, errors, role information, and resets.
  - **Definition of done:** Browser and Durable Object can exchange and validate all required message types without undocumented message shapes.

- [ ] **Task 3.4 — Assign White, Black, and spectator roles**
  - **Depends on:** Task 3.3
  - **Files:** `src/room.js`
  - **Work:** First participant becomes White, second becomes Black, later participants become spectators. Save connection role/identity with `ws.serializeAttachment()`.
  - **Definition of done:** The server can identify each live socket's role and spectators cannot obtain a player role while both seats are occupied.

- [ ] **Task 3.5 — Persist official room state in SQLite after every move**
  - **Depends on:** Tasks 3.1 and 3.4
  - **Files:** `src/room.js`
  - **Work:** Create/load room state and save the current position immediately after every accepted move and reset. Use no timers.
  - **Definition of done:** Refreshing or reconnecting retrieves the latest saved position, and there is no periodic or delayed save mechanism anywhere in the project.

- [ ] **Task 3.6 — Make the server authoritative for moves**
  - **Depends on:** Tasks 0.9, 3.3, 3.5
  - **Files:** `src/room.js`, `public/rules.js`, `public/online.js`
  - **Work:** For every move attempt, verify player role, turn, and legality on the Durable Object using the shared `rules.js` logic before changing official state.
  - **Definition of done:** Manually sending an illegal, out-of-turn, or spectator move request cannot change the server's game state.

- [ ] **Task 3.7 — Broadcast accepted moves live**
  - **Depends on:** Task 3.6
  - **Files:** `src/room.js`, `public/online.js`
  - **Work:** After saving an accepted move, send the official new state to White, Black, and all spectators.
  - **Definition of done:** Two devices in the same room show each other's legal moves live without refreshing.

- [ ] **Task 3.8 — Add room-code interface and reconnect behavior**
  - **Depends on:** Task 3.7
  - **Files:** `public/index.html`, `public/styles.css`, `public/app.js`, `public/online.js`
  - **Work:** Let users type a room code, show their assigned role, connect to the room, and restore the latest official game after refresh.
  - **Definition of done:** Entering the same code on two devices joins one shared game, and refreshing does not create a fresh position.

- [ ] **Task 3.9 — Add server-controlled New Game**
  - **Depends on:** Task 3.8
  - **Files:** `src/room.js`, `public/online.js`, `public/app.js`
  - **Work:** Send a reset request to the Durable Object, replace official state with the standard starting position, save immediately, and broadcast to everyone.
  - **Definition of done:** Clicking New Game resets both players and spectators to the same new starting position and survives refresh.

- [ ] **Task 3.10 — Verify ONLINE end-to-end on multiple devices**
  - **Depends on:** Task 3.9
  - **Files:** all Phase 3 files
  - **Work:** Test player order, spectator behavior, legal and illegal moves, all special chess rules, disconnect/reconnect, refresh, server state, and New Game.
  - **Definition of done:** ONLINE satisfies every requirement in `ProductSpec.md` on two separate devices and the server remains the sole authority.

- [ ] **Task 3.11 — Deploy full three-mode release**
  - **Depends on:** Task 3.10
  - **Files:** entire project
  - **Work:** Publish the tested three-mode build to Cloudflare and rerun the perft test before release.
  - **Definition of done:** HOT-SEAT, VS COMPUTER, and ONLINE all work at the public URL and perft remains exactly 20 / 400 / 8,902.

---

# Phase 4 — Optional Extras, Built Last

- [ ] **Task 4.1 — Add move sound**
  - **Depends on:** Task 3.11
  - **Files:** `public/app.js` and optional small audio asset
  - **Work:** Play a short, unobtrusive sound only after a move is successfully completed.
  - **Definition of done:** Sound never plays for rejected/illegal moves and does not interfere with gameplay.

- [ ] **Task 4.2 — Add online resign**
  - **Depends on:** Task 3.11
  - **Files:** `public/online.js`, `public/app.js`, `src/room.js`
  - **Work:** Add a Resign control that sends a server request, records the result in room state, saves it, and broadcasts the result.
  - **Definition of done:** Only White or Black can resign, all connected clients see the result immediately, and refresh preserves the resigned game state.

- [ ] **Task 4.3 — Final regression and polish pass**
  - **Depends on:** Tasks 4.1 and/or 4.2 if built
  - **Files:** entire project
  - **Work:** Recheck Figma match, responsive layout, all three modes, WebSocket behavior, server persistence, special rules, and perft counts.
  - **Definition of done:** No required feature regressed, optional extras behave correctly, and perft remains 20 / 400 / 8,902.

---

# Required Build Sequence Summary

The project must move through these gates in order:

**Rules proof → HOT-SEAT live on Cloudflare → VS COMPUTER → ONLINE rooms → optional extras.**

The first implementation task to pick is **Task 0.1 — Create the Cloudflare Worker project shell**. However, no implementation should begin until Tim selects the task to start.
