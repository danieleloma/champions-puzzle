# GSAP Animation Architecture Guide for Claude Code

## Purpose

This document defines how Claude Code should use **GSAP** when building a polished web-based puzzle game.

The goal is to keep the game:

- visually polished
- responsive
- maintainable
- performant
- easy to extend with new puzzle mechanics
- architecturally separated between game logic, UI state, and animation

The core principle is:

> **React/TypeScript owns game state and logic. GSAP owns visual animation.**

Do not use GSAP as the source of truth for game state.

---

# 1. Recommended Stack

Use the following architecture unless the project has a strong reason to differ:

- **React** — UI and component structure
- **TypeScript** — game logic, types, state machines, validation
- **GSAP** — visual animation and timelines
- **CSS** — layout, styling, simple transitions
- **requestAnimationFrame** — only for genuine continuous/high-frequency game loops
- **React refs** — references to DOM elements that GSAP animates

Recommended GSAP plugins where appropriate:

- `ScrollTrigger` — only for non-game scroll-driven sections
- `Flip` — useful for layout/state transitions
- `Draggable` — useful for drag-based puzzle mechanics
- `CustomEase` — only when a custom easing curve materially improves the interaction
- `MotionPathPlugin` — only when pieces genuinely need path-based movement

Do not add plugins simply because they are available.

---

# 2. Core Architectural Principle

The application should have three distinct layers.

```text
GAME LOGIC
    ↓
GAME STATE
    ↓
UI / DOM
    ↓
GSAP ANIMATION
```

### Game Logic

Responsible for:

- puzzle rules
- valid and invalid moves
- win/loss conditions
- scoring
- timers
- level progression
- piece positions
- puzzle generation
- difficulty
- game history

### Game State

Responsible for representing the authoritative state of the game.

For example:

```ts
type Tile = {
  id: string
  row: number
  col: number
}

type GameState = {
  tiles: Tile[]
  moves: number
  score: number
  status: "idle" | "playing" | "won" | "paused"
}
```

### GSAP

Responsible only for presenting state changes visually.

For example:

```text
Game state says:
Tile A moved from position 3 → position 4

GSAP:
Animate Tile A from visual position 3 → visual position 4
```

GSAP should never determine whether the move was actually valid.

---

# 3. Do Not Store Game State in GSAP

Avoid patterns such as:

```ts
tile.style.transform = ...
```

being treated as the authoritative tile position.

Likewise, do not inspect a GSAP animation to determine game state:

```ts
if (tile._gsap.x === targetX) {
  // assume tile is in position
}
```

This creates fragile coupling between game logic and presentation.

Instead:

```ts
const nextState = moveTile(gameState, tileId)

if (nextState.valid) {
  setGameState(nextState.state)
}
```

Then trigger the visual animation.

---

# 4. React State vs GSAP

React state should represent meaningful game changes.

Do not update React state continuously during an animation.

Bad:

```ts
onUpdate={() => {
  setPosition(progress)
}}
```

This can create unnecessary React renders.

Prefer:

```ts
gsap.to(element, {
  x: targetX,
  duration: 0.35,
  ease: "power2.out"
})
```

React should update when the game state changes, not on every animation frame.

---

# 5. Use Refs for Animated Elements

When GSAP directly controls an element, use a React ref.

Example:

```tsx
const tileRef = useRef<HTMLDivElement>(null)

useGSAP(() => {
  if (!tileRef.current) return

  gsap.to(tileRef.current, {
    x: 100,
    duration: 0.4
  })
}, { scope: tileRef })
```

For a board containing many pieces, prefer a map of refs or a dedicated component per animated piece.

Example:

```ts
const tileRefs = useRef<Record<string, HTMLDivElement | null>>({})
```

Then:

```tsx
ref={(element) => {
  tileRefs.current[tile.id] = element
}}
```

This allows the animation system to address specific pieces without forcing the entire board to re-render.

---

# 6. Prefer `@gsap/react`

When using React, use GSAP's React integration where appropriate.

The preferred pattern is:

```ts
import { useGSAP } from "@gsap/react"
```

and:

```tsx
useGSAP(() => {
  // GSAP code
}, { scope: containerRef })
```

This helps with:

- React lifecycle management
- cleanup
- context-aware animations
- component unmounting
- avoiding stale animation instances

Register GSAP plugins centrally where possible.

---

# 7. Use `gsap.context()` / `useGSAP()` Cleanup

Every animation created inside a React component must be cleaned up appropriately.

Avoid leaving animations running after a component is unmounted.

Prefer:

```tsx
useGSAP(() => {
  const ctx = gsap.context(() => {
    gsap.to(".piece", {
      rotation: 10
    })
  }, containerRef)

  return () => ctx.revert()
})
```

Or use the cleanup capabilities provided by `useGSAP`.

This is particularly important for:

- level transitions
- modals
- game screens
- restarting games
- navigating between routes

---

# 8. Create an Animation Service

Do not scatter complicated GSAP code throughout every React component.

For a non-trivial puzzle game, create an animation layer.

Recommended structure:

```text
src/
├── game/
│   ├── logic/
│   ├── state/
│   └── types/
│
├── components/
│   ├── PuzzleBoard.tsx
│   ├── PuzzleTile.tsx
│   └── GameUI.tsx
│
├── animations/
│   ├── tileAnimations.ts
│   ├── boardAnimations.ts
│   ├── feedbackAnimations.ts
│   ├── victoryAnimations.ts
│   └── animationUtils.ts
│
└── hooks/
    └── usePuzzleAnimations.ts
```

This makes it easier for Claude Code to reason about the project.

---

# 9. Animation Functions Should Have Clear Responsibilities

Example:

```ts
export function animateTileMove(
  element: HTMLElement,
  x: number,
  y: number
) {
  return gsap.to(element, {
    x,
    y,
    duration: 0.35,
    ease: "power2.out"
  })
}
```

For invalid moves:

```ts
export function animateInvalidMove(element: HTMLElement) {
  return gsap.timeline()
    .to(element, {
      x: "+=8",
      duration: 0.06
    })
    .to(element, {
      x: "-=16",
      duration: 0.12
    })
    .to(element, {
      x: 0,
      duration: 0.06
    })
}
```

This keeps animation behavior reusable.

---

# 10. Use Timelines for Multi-Step Sequences

Whenever several animations need to happen in a deliberate sequence, use a timeline.

Example:

```ts
const timeline = gsap.timeline()

timeline
  .to(tile, {
    scale: 1.08,
    duration: 0.12
  })
  .to(tile, {
    scale: 1,
    duration: 0.18
  })
  .to(tile, {
    rotation: 360,
    duration: 0.5,
    ease: "power2.inOut"
  })
```

Use timelines for:

- puzzle completion
- level transitions
- board reveals
- shuffle sequences
- error feedback
- score celebrations
- onboarding
- modal transitions

Avoid deeply nested callbacks.

Bad:

```ts
gsap.to(a, {
  onComplete: () => {
    gsap.to(b, {
      onComplete: () => {
        gsap.to(c)
      }
    })
  }
})
```

Prefer:

```ts
gsap.timeline()
  .to(a, {...})
  .to(b, {...})
  .to(c, {...})
```

---

# 11. Use Labels for Complex Sequences

For more complex game sequences:

```ts
const tl = gsap.timeline()

tl.addLabel("start")
  .to(board, {...})
  .addLabel("celebrate")
  .to(pieces, {...})
  .addLabel("finish")
  .to(score, {...})
```

This makes sequences easier to modify.

Claude Code should prefer semantic labels over arbitrary timing calculations.

---

# 12. Avoid Magic Numbers

Do not scatter values such as:

```ts
duration: 0.37
x: 142
y: 283
```

throughout the application unless they represent an actual design requirement.

Centralize animation constants:

```ts
export const animationConfig = {
  tileMove: {
    duration: 0.35,
    ease: "power2.out"
  },

  tileFeedback: {
    duration: 0.18,
    ease: "power2.out"
  },

  levelTransition: {
    duration: 0.6,
    ease: "power3.inOut"
  }
}
```

This makes the animation system tunable.

---

# 13. Create an Animation Token System

For a polished game, define reusable motion tokens.

Example:

```ts
export const motion = {
  instant: 0.1,
  fast: 0.18,
  normal: 0.35,
  slow: 0.6,
  dramatic: 0.9,

  ease: {
    standard: "power2.out",
    smooth: "power3.inOut",
    enter: "power2.out",
    exit: "power2.in",
    bounce: "back.out(1.7)"
  }
}
```

Claude Code should use these tokens rather than inventing new animation values for every interaction.

---

# 14. Puzzle Pieces Should Animate With Transforms

Prefer GPU-friendly transforms:

```ts
x
y
scale
rotation
rotationX
rotationY
```

over repeatedly animating layout properties such as:

```ts
top
left
width
height
margin
```

For movement, prefer:

```ts
gsap.to(element, {
  x: targetX,
  y: targetY
})
```

rather than:

```ts
gsap.to(element, {
  left: targetX,
  top: targetY
})
```

This generally produces smoother movement.

---

# 15. Use CSS for Layout, GSAP for Motion

Do not use GSAP to replace CSS unnecessarily.

CSS should handle:

- grid layout
- flexbox
- sizing
- typography
- responsive behavior
- colors
- borders
- shadows
- static states

GSAP should handle:

- movement
- sequencing
- dynamic transforms
- complex transitions
- gesture feedback
- celebration animations
- coordinated motion

This separation keeps the codebase understandable.

---

# 16. Drag-and-Drop Architecture

For a drag-based puzzle, separate three concepts:

```text
Pointer interaction
       ↓
Game validation
       ↓
GSAP visual response
```

If using `Draggable`, do not let the dragged DOM position become the game's authoritative state.

Conceptually:

```ts
onDragEnd(tile) {
  const result = validateDrop(tile, currentGameState)

  if (result.valid) {
    commitMove(result)
    animateSuccessfulDrop(tile)
  } else {
    animateReturnToOriginalPosition(tile)
  }
}
```

This is much more reliable than using the DOM position to determine the puzzle state.

---

# 17. Snap Pieces Into Place

Puzzle games benefit from strong visual feedback when pieces reach their destination.

Example:

```ts
gsap.to(piece, {
  x: targetX,
  y: targetY,
  duration: 0.3,
  ease: "back.out(1.2)"
})
```

A subtle scale effect can reinforce the interaction:

```ts
gsap.timeline()
  .to(piece, {
    scale: 1.05,
    duration: 0.1
  })
  .to(piece, {
    x: targetX,
    y: targetY,
    scale: 1,
    duration: 0.3,
    ease: "back.out(1.2)"
  })
```

Keep this restrained. The objective is to make the interaction feel satisfying, not distracting.

---

# 18. Invalid Move Feedback

Invalid moves should communicate immediately.

Possible animation:

```ts
gsap.timeline()
  .to(piece, {
    x: "+=6",
    duration: 0.05
  })
  .to(piece, {
    x: "-=12",
    duration: 0.1
  })
  .to(piece, {
    x: 0,
    duration: 0.05
  })
```

The animation should be short.

Avoid large, slow error animations that interrupt gameplay.

---

# 19. Winning Animation

The winning sequence should be a coordinated timeline rather than many unrelated animations.

Example:

```ts
const tl = gsap.timeline()

tl.to(board, {
  scale: 1.02,
  duration: 0.25,
  ease: "power2.out"
})
.to(pieces, {
  y: -12,
  stagger: 0.04,
  duration: 0.25,
  ease: "power2.out"
})
.to(pieces, {
  y: 0,
  stagger: 0.03,
  duration: 0.25,
  ease: "bounce.out"
})
.to(resultPanel, {
  autoAlpha: 1,
  y: 0,
  duration: 0.4,
  ease: "power3.out"
})
```

The exact values should be tuned to the game's visual language.

---

# 20. Avoid Animating Every Piece Independently When Possible

If 100+ pieces are present, avoid creating unnecessary independent timelines.

Prefer:

```ts
gsap.to(pieces, {
  y: -10,
  stagger: 0.02
})
```

over manually creating 100 unrelated animations.

Use stagger where it produces a meaningful visual effect.

---

# 21. Kill or Replace Conflicting Animations

Interactive games frequently cause animations to overlap.

For example:

```text
User clicks piece
→ movement starts
→ user clicks again
→ another movement starts
```

Without management, multiple tweens can fight each other.

Use:

```ts
gsap.killTweensOf(element)
```

when appropriate before starting a new mutually exclusive animation.

Alternatively, structure animations using timelines and overwrite behavior.

Example:

```ts
gsap.to(element, {
  x: targetX,
  duration: 0.35,
  overwrite: "auto"
})
```

Claude Code should consider animation conflicts whenever an element can be interacted with repeatedly.

---

# 22. Animation Completion Must Not Define Game Validity

Do not make the game wait for an animation to determine whether an action was correct.

Bad architecture:

```text
Animate piece
→ inspect final position
→ decide whether move is valid
```

Correct architecture:

```text
Player action
→ validate move
→ update game state
→ animate visual result
```

The animation is a consequence of the state change.

---

# 23. Use `onComplete` Carefully

`onComplete` is appropriate for visual follow-up behavior.

For example:

```ts
gsap.to(piece, {
  scale: 1,
  duration: 0.2,
  onComplete: () => {
    showNextVisualState()
  }
})
```

But avoid putting core game logic inside animation callbacks.

Do not do:

```ts
onComplete: () => {
  gameState.isSolved = true
}
```

Instead:

```ts
setGameState({
  ...state,
  status: "won"
})
```

Then animate the resulting state.

---

# 24. Handle Reduced Motion

The game should respect the user's reduced-motion preference where practical.

Use:

```ts
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches
```

Then simplify non-essential animations.

For example:

```ts
const duration = prefersReducedMotion ? 0 : 0.35
```

Do not remove essential feedback that communicates game state, but reduce decorative motion.

---

# 25. Mobile Performance

The game should be designed for mobile from the beginning.

Avoid:

- excessive blur animations
- huge numbers of simultaneous shadows
- expensive filters
- animating layout properties
- unnecessary DOM nodes
- continuous React state updates during animation

Prefer:

- transforms
- opacity
- composited properties
- limited simultaneous animations
- CSS for static rendering

If a puzzle contains many pieces, test on a mid-range mobile device rather than only a desktop.

---

# 26. Do Not Use GSAP for Everything

GSAP is powerful, but not every animation needs JavaScript.

Use CSS for simple states:

```css
.tile {
  transition: opacity 180ms ease;
}
```

Use GSAP when you need:

- sequencing
- dynamic values
- coordinated movement
- interruption
- timelines
- complex easing
- gesture-driven motion
- stateful visual choreography

A good rule:

> **Simple state transition → CSS. Complex choreography → GSAP.**

---

# 27. Avoid `setInterval` for Visual Animation

Do not create animation loops like:

```ts
setInterval(() => {
  element.style.transform = ...
}, 16)
```

For continuous custom rendering, use:

```ts
requestAnimationFrame
```

For normal visual animations, use GSAP.

---

# 28. Animation API Should Be Declarative From the Game Layer

The game layer should ideally communicate intent.

For example:

```ts
animateTileMove(tileId, destination)
```

rather than:

```ts
gsap.to(document.querySelector(...), {
  x: 120,
  y: 240
})
```

The animation layer resolves:

- which element
- which coordinates
- which duration
- which easing
- what feedback is appropriate

This makes the game logic easier for Claude Code to maintain.

---

# 29. Recommended Animation API

A mature puzzle game could expose functions such as:

```ts
animateTileMove(tileId, destination)
animateTileSnap(tileId)
animateInvalidMove(tileId)
animateTileSelect(tileId)
animateTileDeselect(tileId)
animateShuffle()
animateBoardEnter()
animateBoardExit()
animateLevelComplete()
animateScoreChange()
animateGameOver()
animateRestart()
```

This provides a clear interface between the game and animation systems.

---

# 30. Use Animation State Sparingly

You may need an animation state such as:

```ts
type AnimationState =
  | "idle"
  | "moving"
  | "celebrating"
```

But do not duplicate the entire game state inside GSAP.

If the game state says:

```ts
status: "won"
```

the animation layer should respond to that state.

It should not create its own competing:

```ts
gameStatus: "winning"
```

unless there is a genuine presentation-only reason.

---

# 31. Level Transitions

For level changes:

```text
Current level
     ↓
Exit animation
     ↓
Replace game state
     ↓
Build next level
     ↓
Enter animation
```

Avoid replacing the entire DOM abruptly.

Example:

```ts
const tl = gsap.timeline()

tl.to(board, {
  autoAlpha: 0,
  scale: 0.96,
  duration: 0.25
})

tl.call(() => {
  loadNextLevel()
})

tl.fromTo(
  board,
  {
    autoAlpha: 0,
    scale: 1.04
  },
  {
    autoAlpha: 1,
    scale: 1,
    duration: 0.4,
    ease: "power3.out"
  }
)
```

However, the actual game-state transition should remain owned by the game layer.

---

# 32. Avoid Memory Leaks

Claude Code should inspect for:

- timelines that remain active after unmount
- event listeners that are not removed
- `Draggable` instances that are not killed
- `ScrollTrigger` instances that are not cleaned up
- stale refs
- duplicated animations after React re-renders

Use proper GSAP cleanup.

For example:

```ts
return () => {
  timeline.kill()
}
```

Where applicable.

---

# 33. Avoid Recreating Timelines on Every Render

Do not write:

```tsx
useEffect(() => {
  gsap.timeline().to(...)
})
```

without carefully controlling dependencies.

This can create a new animation every render.

Use:

```tsx
useGSAP(() => {
  // animation
}, {
  dependencies: [...]
})
```

or explicit event-driven animation functions.

---

# 34. Animation and Game State Testing

Game logic should be testable without a browser animation.

For example:

```ts
const result = moveTile(state, "tile-1")
expect(result.valid).toBe(true)
```

Do not make tests depend on:

```ts
gsap.to(...)
```

The animation layer can have separate integration testing.

This separation makes the puzzle significantly easier to debug.

---

# 35. Debugging Strategy for Claude Code

When a visual bug occurs, Claude Code should determine which layer is responsible.

### If the puzzle rule is wrong

Inspect:

```text
game/logic
game/state
```

### If the correct piece moves to the wrong position

Inspect:

```text
coordinate calculation
board layout
animation layer
```

### If the animation is jerky

Inspect:

```text
React re-renders
layout properties
number of simultaneous animations
DOM complexity
expensive CSS effects
```

### If animations overlap

Inspect:

```text
timeline lifecycle
killTweensOf
overwrite
interaction locking
```

Do not randomly change durations until the underlying problem is identified.

---

# 36. Interaction Locking

For interactions where concurrent moves are invalid, consider a temporary interaction lock.

Example:

```ts
if (isAnimating) return
```

But avoid locking the entire game unnecessarily.

A better architecture is often:

```ts
const lockedTiles = new Set<string>()
```

so only the affected pieces are temporarily unavailable.

If animations are interruptible, prefer interruption over unnecessary global locks.

---

# 37. Use GSAP's Positioning Model Consistently

Choose one positioning strategy and use it consistently.

For example:

```text
CSS Grid determines tile cells
GSAP controls transforms
```

or:

```text
Absolute positioning determines base coordinates
GSAP controls transforms
```

Do not mix multiple coordinate systems without a clear reason.

A common robust approach is:

```text
Board layout
→ CSS Grid

Tile location
→ grid row / column

Visual movement
→ GSAP transform
```

---

# 38. Puzzle Board Recommendation

For many grid-based puzzle games, prefer a structure similar to:

```tsx
<div className="board">
  {tiles.map(tile => (
    <PuzzleTile
      key={tile.id}
      tile={tile}
      ref={...}
    />
  ))}
</div>
```

The board establishes the layout.

The tile component owns its visual representation.

GSAP animates the tile's transform.

The game engine owns the tile's logical position.

---

# 39. Dragging Recommendation

For drag-based games:

```text
Pointer down
     ↓
GSAP / Draggable visual interaction
     ↓
Pointer release
     ↓
Game engine validates target
     ↓
Valid → snap into place
Invalid → animate back
```

The drag position is temporary visual state.

The game state changes only after validation.

---

# 40. Make Animation Feel Intentional

Do not animate simply because an animation is possible.

Every animation should answer one of these questions:

- What changed?
- What should the player notice?
- What action did the player perform?
- What feedback confirms the action?
- What state is the game entering?
- Does the animation improve clarity or game feel?

If the animation does not communicate anything, remove it.

---

# 41. Recommended Motion Language

The puzzle game should establish a consistent motion language.

### Small interactions

Use:

```text
0.1–0.2s
```

Examples:

- hover
- selection
- button feedback
- small scale changes

### Standard movement

Use:

```text
0.25–0.45s
```

Examples:

- tile movement
- snapping
- panel transitions

### Major transitions

Use:

```text
0.5–0.9s
```

Examples:

- level changes
- victory sequences
- major UI transitions

These are starting points, not hard rules.

---

# 42. Easing Guidelines

Avoid using one easing curve everywhere.

Recommended starting point:

### Standard movement

```ts
ease: "power2.out"
```

### Smooth UI transition

```ts
ease: "power3.inOut"
```

### Enter animation

```ts
ease: "power3.out"
```

### Exit animation

```ts
ease: "power2.in"
```

### Playful snap

```ts
ease: "back.out(1.2)"
```

### Celebration

A stronger elastic/bounce effect may be appropriate, but use it sparingly.

---

# 43. Claude Code Implementation Rules

When Claude Code modifies this project, it should follow these rules:

1. **Never use GSAP as the source of truth for game state.**
2. **Do not put game rules inside GSAP callbacks.**
3. **Use React/TypeScript for state and game logic.**
4. **Use refs for elements directly animated by GSAP.**
5. **Use transforms instead of layout properties for movement.**
6. **Use timelines for coordinated sequences.**
7. **Use reusable animation functions rather than duplicating GSAP code.**
8. **Centralize motion constants.**
9. **Clean up GSAP instances when components unmount.**
10. **Avoid creating animations on every React render.**
11. **Avoid updating React state every animation frame.**
12. **Use CSS for simple transitions.**
13. **Use GSAP for complex choreography.**
14. **Handle animation conflicts explicitly.**
15. **Respect reduced-motion preferences.**
16. **Optimize for mobile performance.**
17. **Keep animation code separate from puzzle logic.**
18. **Do not add GSAP plugins unless they solve a real requirement.**
19. **Prefer simple solutions over unnecessary animation complexity.**
20. **Preserve the existing animation architecture when modifying unrelated game functionality.**

---

# 44. Suggested Claude Code Project Prompt

When starting the project, Claude Code can be given the following architectural instruction:

> Build this puzzle game using React and TypeScript.
>
> Use GSAP for non-trivial animations and transitions.
>
> Keep game logic completely independent from GSAP. Game state must remain the single source of truth for puzzle positions, valid moves, score, level, and game status.
>
> Use React state for meaningful game-state changes and refs for DOM elements that GSAP directly animates. Do not update React state continuously from GSAP `onUpdate`.
>
> Create a dedicated `animations/` layer containing reusable animation functions for tile movement, snapping, invalid moves, selection, shuffling, level transitions, and victory sequences.
>
> Use GSAP timelines for multi-step sequences and centralized motion tokens for duration and easing.
>
> Prefer CSS for layout and simple transitions. Use GSAP transforms for movement rather than animating `top` and `left` wherever possible.
>
> Prevent conflicting tweens using appropriate GSAP overwrite behavior or explicit tween cleanup.
>
> Clean up GSAP animations, Draggable instances, and other animation resources when React components unmount.
>
> Make all animations responsive and performant on mobile.
>
> Respect `prefers-reduced-motion` for non-essential animations.
>
> Do not introduce additional animation libraries unless explicitly requested.
>
> Before implementing a new animation, inspect the existing animation architecture and reuse existing utilities, tokens, and patterns rather than creating duplicate implementations.

---

# 45. Example End-to-End Architecture

A well-structured move should look conceptually like this:

```text
PLAYER ACTION
     │
     ▼
Game Controller
     │
     ▼
Validate Move
     │
     ├── Invalid ──────────────┐
     │                         ▼
     │                  Invalid Animation
     │
     ▼
Update Game State
     │
     ▼
Calculate Visual Destination
     │
     ▼
Animation Layer
     │
     ▼
GSAP Tween / Timeline
     │
     ▼
Visual Result
```

The important part is that **GSAP is downstream from the game engine**.

---

# 46. Final Principle

The project should not be designed around GSAP.

It should be designed around the **game**.

GSAP is the visual presentation layer that makes the game feel responsive, polished, tactile, and satisfying.

The ideal architecture is:

```text
                 ┌─────────────────┐
                 │   GAME LOGIC    │
                 │                 │
                 │ Rules           │
                 │ Validation      │
                 │ Scoring         │
                 │ Levels          │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │   GAME STATE    │
                 │                 │
                 │ Tiles           │
                 │ Positions       │
                 │ Status          │
                 │ Score           │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      REACT      │
                 │                 │
                 │ Components      │
                 │ UI              │
                 │ DOM             │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │      GSAP       │
                 │                 │
                 │ Movement        │
                 │ Feedback        │
                 │ Timelines       │
                 │ Transitions     │
                 │ Celebration     │
                 └─────────────────┘
```

**Use GSAP to make the game feel alive, not to make the game work.**

That distinction should guide every animation implementation Claude Code makes.
