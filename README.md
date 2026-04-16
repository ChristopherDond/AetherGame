# AETHER

[Versao em Portugues](README.pt-BR.md)

AETHER is a top-down 2D survival game set on a hostile alien planet.
You are a crash-landed explorer trying to stay alive while building infrastructure, managing energy, and unlocking upgrades.

Built with plain HTML, CSS, and JavaScript modules.
No framework, no build step, fast iteration.

## What Is Already Implemented

- Procedural world generation with deterministic seed-based noise
- Resource clusters distributed across different terrain types
- Mining loop with progress feedback
- Inventory with consumable use and selective discard modal
- Building placement system with cost, collision, and terrain checks
- Energy production and consumption simulation
- Crafting recipes gated by structure proximity and energy
- Research tree with prerequisites and permanent player bonuses
- Habitat safety radius (O2 and HP regeneration)
- Day and night cycle affecting energy production
- Touch controls for mobile devices
- Automatic save/load through browser local storage
- Lightweight sound effects via Web Audio API

## Core Loop

1. Explore and locate resource clusters.
2. Mine materials near your character.
3. Build structures to improve production and survivability.
4. Manage energy for crafting and research progression.
5. Craft support items (O2 Pack, Medkit, Battery, Alloy).
6. Unlock research upgrades and survive longer to improve score.

## Controls

### Desktop

- Move: WASD or Arrow Keys
- Mine: E
- Open Build panel: B
- Open Craft panel: C
- Open Inventory panel: I
- Open Research panel: R
- Pause/Resume: P
- Cancel placement / close open overlays: Escape

### Mobile

- Virtual movement pad on the left
- Action buttons on the right (mine and panel shortcuts)

## Run Locally

Because the game uses ES modules, serve it through a local web server.

Option A (Python):

```bash
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```

Option B (VS Code Live Server):

1. Open the project folder.
2. Start Live Server.
3. Open the served page.

## Project Layout

- `index.html`: Main screens, HUD containers, and panels
- `css/style.css`: Visual style, layout, responsive behavior, touch controls
- `js/constants.js`: Tile, world, resource, structure, and research data
- `js/utils.js`: Utility math and deterministic random helpers
- `js/worldgen.js`: Terrain and resource generation
- `js/game.js`: Runtime loop, rendering, UI, input, systems, save/load, audio

## Systems Summary

### World

- Map grid: 80 x 60 tiles
- Tile size: 40 px
- Deterministic generation from seed values

### Survival

- O2 drains outside habitat protection
- HP drains when O2 reaches zero
- Habitat restores O2 and HP when nearby

### Economy and Progression

- Structure costs are paid from inventory resources
- Solar and turbine output depends on day/night
- Nuclear generator gives stable energy
- Farm and water extractor consume energy to produce resources over time
- Research unlocks permanent boosts (mining speed, max O2, max HP)

### Save System

Auto-save runs during gameplay and on key transitions.
Data is stored in local storage key `aether_save_v1` and includes:

- Time/cycle counters
- World seed and generated entities
- Placed structures
- Player state and inventory
- Unlocked research

## Current Status

Playable prototype under active development.
Current codebase focuses on core systems (survival, building, crafting, research, save/load) and responsive browser play.

## Roadmap Ideas

- Deeper crafting and production chains
- Better balancing for energy and progression pacing
- Hazards, enemies, and dynamic world events
- Win condition / endgame sequence (escape ramp progression)
- Achievement and long-term progression systems

## License

There is currently no license file in the repository.
If you plan to distribute or accept contributions, add an explicit license.

## Credits

Designed and implemented as an evolving browser survival experience focused on exploration, progression, and base-building systems.