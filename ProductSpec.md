# Treasure Chess — Product Specification

**Product owner: Tim Donnelly**

## 1. Product Summary

Treasure Chess is a browser chess game with a traditional board and pieces, plus a simple pirate/treasure theme. The game must work without accounts and must support three modes: HOT-SEAT, VS COMPUTER, and ONLINE.

The product should feel approachable and familiar to someone who already knows normal chess. The pirate theme should add personality without making the board harder to read.

## 2. Target User

The main user is someone who wants to open a link and play chess immediately without creating an account, installing software, or learning a new interface.

Secondary users are friends playing together on one device, players practicing against a lightweight browser opponent, and two people connecting from separate devices with a shared room code.

## 3. Design Direction

### Visual principles

- Keep the chessboard visually dominant.
- Use a classic 8×8 layout with clear light and dark squares.
- Use readable, recognizable chess pieces.
- Use a limited treasure-inspired palette such as gold, aged parchment, dark brown wood, brass, and muted black.
- Add restrained pirate details such as a small compass motif, rope borders, map texture, treasure-chest iconography, or subtle coin accents.
- Avoid decorative elements that interfere with move visibility.
- Legal-move highlights, selected-square highlights, check indicators, and last-move indicators must remain easy to understand.

### Figma matching

When implementation begins, spacing, sizing, typography, controls, and visual hierarchy should follow the Figma designs in the project as closely as practical while preserving chess usability and responsive behavior.

## 4. Chess Rules Requirements

All modes must use the same `rules.js` module. A **module** is a JavaScript file that exposes reusable functions to other files.

The rules module must implement:

- Pawn, knight, bishop, rook, queen, and king movement.
- Normal captures.
- Check detection.
- Legal-move filtering so a player cannot leave their own king in check.
- Checkmate.
- Stalemate.
- Kingside and queenside castling with all normal restrictions.
- En passant with the correct one-move availability window.
- Pawn promotion to queen, rook, bishop, or knight.
- Turn tracking.
- Castling-right tracking.
- En-passant-target tracking.
- Game-over detection.

Illegal moves must be impossible to complete in the interface, and online mode must reject them on the server even if a user manually sends a bad request.

## 5. Rules Proof Requirement

Before any playable interface is built, the rules module must pass a perft test from the standard starting position:

- Depth 1 = 20 legal positions.
- Depth 2 = 400 legal positions.
- Depth 3 = 8,902 legal positions.

No mode implementation may begin until all three counts are exact.

## 6. Mode 1 — HOT-SEAT

### User experience

Two players use the same device. White moves first, then Black, alternating on the same board.

### Required behavior

- Start from the normal chess position.
- Only the side whose turn it is can move.
- Clicking or tapping a piece shows only legal destinations.
- Illegal destinations cannot complete a move.
- Promotion asks the player to choose queen, rook, bishop, or knight.
- The game clearly shows whose turn it is.
- The game clearly announces checkmate or stalemate.
- A New Game control returns the board to the standard starting position.
- The game must be deployed to the public Cloudflare URL before work starts on VS COMPUTER.

## 7. Mode 2 — VS COMPUTER

### User experience

The human selects or is assigned the Gold/Brown themed side specified by the final interface, and the browser controls the opposing side.

### Computer behavior

The computer must use minimax with alpha-beta pruning at depth 2.

A **search depth** is the number of future move layers the computer examines. Depth 2 means the computer considers its candidate move and the opponent's likely reply before scoring the position.

A **position evaluation** is a numerical score estimating which side is better. The first version should use a simple, explainable scoring system based mainly on piece values, with optional small positional bonuses only if needed.

### Required behavior

- The human can only make legal moves.
- The computer must always choose a legal move.
- The computer search runs in the browser, not on the Worker.
- The computer must respond within two seconds under normal supported-device conditions.
- Check, checkmate, stalemate, castling, en passant, and promotion must work for both sides.
- New Game resets the game and the computer state.

## 8. Mode 3 — ONLINE

### User experience

A player enters a room code. Another player enters the same room code on another device. Both see the same game and moves appear live.

### Player assignment

- First participant in a room becomes White.
- Second participant becomes Black.
- Additional participants become spectators.
- Spectators can watch but cannot move.

### Server authority

The Durable Object is the official source of truth for the room. Every attempted move must be checked by the server using the same `rules.js` logic used by the browser.

### Persistence

The Durable Object saves the current game state to SQLite after every accepted move. This allows a browser refresh to reconnect to the same room and receive the latest official position.

No timers, delayed save jobs, or periodic persistence loops may be used.

### WebSocket protocol

Every WebSocket message must be JSON and use this outer shape:

```json
{
  "type": "message-name",
  "payload": {}
}
```

The exact message names may evolve during implementation, but the protocol should cover at least:

- Joining or initial state delivery.
- Move attempts.
- Accepted state updates.
- Rejected move errors.
- New Game resets.
- Player/spectator role information.
- Optional resign events if that feature is built.

### Identity

Each accepted WebSocket stores its room role and player identity in `ws.serializeAttachment()` so reconnect-safe server logic can distinguish White, Black, and spectators.

### Required behavior

- Same room code maps to the same Durable Object through `env.ROOM.getByName(roomCode)`.
- White and Black moves appear live on both devices.
- Spectators receive live updates.
- Only the correct player may move on their turn.
- The server rejects illegal or out-of-turn moves.
- Refreshing rejoins the same game state.
- New Game resets the room for all connected clients.
- The reset is saved immediately.

## 9. Cloudflare Architecture

### Static site

Browser files are served through the Worker project's `assets` configuration in `wrangler.jsonc`.

`not_found_handling` must be set to `single-page-application`. A **single-page application fallback** means unknown browser routes return the main HTML page instead of a normal 404 page, allowing the front-end to control navigation.

`run_worker_first` must apply to the WebSocket path so online connection requests reach Worker code before static-asset handling.

### Worker configuration

- `compatibility_date`: `2026-09-15`.
- Observability enabled.
- Durable Object binding named `ROOM`.
- Durable Object migration configured with `new_sqlite_classes`.

**Observability** means Cloudflare records runtime logs and diagnostic information that help identify production problems.

### Durable Object room

One room code maps to one SQLite-backed Durable Object instance. That object validates moves, stores state, assigns player roles, and broadcasts official updates to connected WebSockets.

## 10. Proposed File Structure

The exact structure may be adjusted during implementation, but the plan is:

```text
/
├── README.md
├── ProductSpec.md
├── FEATUREROADMAP_workplan.md
├── wrangler.jsonc
├── package.json
├── src/
│   ├── worker.js
│   └── room.js
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── rules.js
│   ├── hotseat.js
│   ├── computer.js
│   └── online.js
└── test/
    └── perft.test.js
```

`rules.js` is the only chess-rules implementation. Server-side files must import and use that same rules module rather than creating a second version of the rules.

## 11. New Game Behavior

### HOT-SEAT

Reset only the local game.

### VS COMPUTER

Reset the local game and computer search state.

### ONLINE

Send a reset request to the Durable Object. The server replaces the official state with the standard starting position, saves it immediately, and broadcasts the reset to every connected player and spectator.

## 12. Error Handling

The user should receive simple messages for situations such as:

- Invalid or empty room code.
- Room connection failure.
- Attempting to move as a spectator.
- Attempting to move the wrong color.
- Server-rejected move.
- Lost online connection.

Technical details should go to logs where useful; user-facing text should stay plain and non-technical.

## 13. Accessibility and Responsiveness

- Board must fit on common desktop and mobile screens.
- Controls must remain usable by touch.
- Color alone should not be the only signal for critical states such as check or game over.
- Buttons should have visible text labels or accessible labels.
- Promotion choices must be keyboard- and touch-accessible.

## 14. Explicitly Out of Scope

Do not build:

- Accounts or logins.
- Chess clocks.
- Ratings or matchmaking rankings.
- Draw by threefold repetition.
- Fifty-move-rule draw detection.
- Opening books.
- Move export.
- React.
- Socket.IO.
- Express.
- `ws` package.
- Third-party chess engines or rules libraries.

## 15. Optional Extras — Build Last

Only after all three main modes meet their definitions of done:

1. Play a short sound after a completed move.
2. Add an online Resign button that ends the room game server-side and broadcasts the result.

Neither extra may delay completion of the required modes.
