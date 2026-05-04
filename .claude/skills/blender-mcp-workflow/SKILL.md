---
name: blender-mcp-workflow
description: Best practices for driving Blender via the blender-mcp server (ahujasid/blender-mcp). Use whenever a session involves Blender Python execution, Mantaflow fluid sim, baking, rendering, or scene authoring through the MCP. Covers save discipline, chunking long ops, known Mantaflow Python-API bugs, Blender 4.x Action API drift, GPU setup, and when to NOT use Blender for web hero animations. Saves a half-day of trial-and-error per project.
---

## When to invoke

Trigger on any of:
- "blender", "mantaflow", "fluid sim" mentions in user prompts
- Any `mcp__blender__*` tool call appearing in the available toolset
- A `.blend` file path in the user's message
- Requests for "3D animation for the website" / "venom blob" / "liquid morph" hero
- Setting up or troubleshooting `blender-mcp` (the addon, the `uvx` server, port 9876)

This skill encodes lessons from a multi-hour DS2 session that hit nearly every gotcha. Read it before doing any non-trivial Blender work. Most of these aren't documented in the blender-mcp README or Blender's official Mantaflow docs.

---

## ⚠️ CRITICAL: Blender 5.x Mantaflow is broken

**Mantaflow is non-functional in Blender 5.x as of 5.1.** Confirmed by isolating: a minimal test scene with a single sphere emitter (`flow_behavior='GEOMETRY'`), no animation, no effectors, no force fields, no drivers, default Mantaflow settings, resolution 32, 30 frames — bakes in **4 seconds and produces zero fluid**. Cache files contain only header bytes. Other versions (3.x, 4.x) work normally with the same scene.

**Use Blender 4.5 LTS for any fluid simulation work.** Blender supports installing multiple versions side-by-side; 4.5 LTS and 5.1 do not conflict. Download 4.5 LTS from blender.org/download/lts. Install path is something like `C:\Program Files\Blender Foundation\Blender 4.5\`. Open the .blend file in 4.5 (forward-compatibility from 4.x → 5.x is supported; backward compat may require File → Save As to convert).

The MCP addon (`addon.py`) is the same file regardless of Blender version — install it in 4.5's add-ons folder the same way. Connect to Claude works identically.

If you somehow MUST use Blender 5.x, fluid simulation isn't an option — pivot to mesh shape-key animation or AI video (see "Honest path-selection guide" below).

## The five laws

### 1. Save before AND after every state-changing op

Cheap and non-negotiable. The first line of every MCP call that mutates the scene should be `bpy.ops.wm.save_mainfile()`, and the last line after a successful operation should be too. Crashes happen mid-bake; without saves we rebuild from scratch. File saves are ~50ms.

```python
import bpy
bpy.ops.wm.save_mainfile()  # ← required first line if mutating state
# ... do the thing ...
bpy.ops.wm.save_mainfile()  # ← required after settings changes or successful bakes
```

The `.blend` file MUST be saved before any cache operation — Mantaflow caches paths are relative to the file location.

### 2. One logical operation per MCP call

Combining `free_cache + bake_data + bake_mesh + render` into one Python call **will time out the MCP socket** with `[WinError 10054] An existing connection was forcibly closed`. Even individually quick ops fail when chained.

Split into separate calls:
1. Clear cache (instant — use `shutil`, never `bpy.ops.fluid.free_all()`)
2. Update settings + save (instant)
3. Bake data (separate call, can run 30s–3min)
4. Bake mesh (separate call)
5. Render single frame (separate call)

Each call should complete in under 60 seconds of synchronous work.

### 3. Use shutil for cache deletion, never the Mantaflow operator

`bpy.ops.fluid.free_all()` walks Blender's UI thread to delete hundreds of cache files. The MCP socket times out before it returns. Every. Time.

Replace with file-system delete:
```python
import shutil, os
cache_root = bpy.path.abspath(domain.modifiers["Fluid"].domain_settings.cache_directory)
for sub in ("data", "mesh", "particles", "noise", "guiding"):
    p = os.path.join(cache_root, sub)
    if os.path.exists(p):
        shutil.rmtree(p, ignore_errors=True)
```

Instant, no UI-thread blocking.

### 4. `cache_type='ALL'` + `bake_all()` — never `MODULAR` from Python

Mantaflow's `cache_type='MODULAR'` is broken when triggered from Python: `bake_data()` writes only the **last frame** of the range (e.g. `fluid_data_0120.vdb` only). The UI handles MODULAR fine, but the `bpy.ops.fluid.bake_data()` operator's frame-loop doesn't trigger correctly headlessly.

```python
ds.cache_type = 'ALL'           # not 'MODULAR'
bpy.ops.fluid.bake_all()        # one call, bakes everything
```

### 5. The empty-cache symptom — recognize it on sight

If after a bake you see:

- Cache files all the same size: data ≈ 1,367 bytes, mesh ≈ 23 bytes
- Bake "completed" in under 10 seconds for 100+ frames
- Domain mesh in viewport has 8 vertices (= the empty cube)
- Render shows just a flat plane / dark void

→ **No fluid was simulated.** The bake walked through frames but produced zero fluid grid data. See section "Mantaflow inflow control bugs" below for causes.

---

## Setup checklist (one-time per machine)

1. **Install `uv`** (Python package manager that runs the MCP server):
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```
   Verify: `uv --version` and `uvx --version`. Existing install? It's fine, the `uv` install fails when the binary is held but the existing one works.

2. **Install the Blender addon** from https://github.com/ahujasid/blender-mcp:
   - Download `addon.py`
   - Blender → Edit → Preferences → Add-ons → Install... → pick `addon.py`
   - Tick **"Interface: Blender MCP"**

3. **Register the MCP server** — add to project `.mcp.json`:
   ```json
   "blender": { "command": "uvx", "args": ["blender-mcp"] }
   ```

4. **In Blender**: press `N` in 3D viewport → BlenderMCP tab → click **"Connect to Claude"**. Status text should read `Running on port 9876`.

5. **Restart Claude Code** so it picks up the new `.mcp.json` and spawns `uvx blender-mcp`.

The Poly Haven / Hyper3D / Sketchfab / Hunyuan checkboxes in the panel are optional — leave unticked unless you specifically need imported assets.

---

## Connection drop recovery

When `WinError 10054` appears:

1. **Check Blender is responsive.** Click its title bar.
2. **Re-toggle the Connect button** in the BlenderMCP sidebar. The listener may have died silently — `netstat -ano | findstr :9876` should show LISTENING after toggle.
3. **If the listener is gone after toggle**, the addon's listener thread crashed. Fix: Edit → Preferences → Add-ons → search "MCP" → uncheck and re-check **"Interface: Blender MCP"**. That recreates the listener cleanly.
4. **If the MCP server (Claude side) is stuck**, restart Claude Code so `uvx blender-mcp` respawns fresh.
5. The `.blend` file is your safety net — if it was saved before the crash (rule #1), state is intact when Blender reopens.

---

## Mantaflow inflow control bugs (the deep ones)

This is the worst time-sink in the API. **Every method of "emit fluid for one frame then stop" produces empty caches in our testing:**

| Approach | Result |
|---|---|
| `use_inflow` keyframed True@1, False@2 (LINEAR interp) | Over-emits — fluid fills domain |
| `use_inflow` keyframed True@1, False@2 (CONSTANT interp) | Empty cache — no fluid simulated |
| Driver expression `frame <= 1` controlling `use_inflow` | `bake_data()` terminates after frame 1 |
| Animating emitter location outside domain at frame 2 | `bake_data()` terminates after frame 1 |
| Animating emitter scale to ~0 at frame 2 | `bake_data()` terminates after frame 1 |
| `use_inflow=True` permanently (no animation) | **Bakes correctly**, but continuous emission fills domain |

Verified true even when triggered from Blender's UI bake button — the bug is in Mantaflow's frame-loop interaction with boolean keyframes/drivers, not just the Python operator.

**Workarounds:**
- **Tiny continuous emitter**: keep `use_inflow=True`, shrink emitter to 0.5 × 0.4 × 0.05 so 120 frames of emission ≈ a small puddle's worth of fluid. Useful for "drip" effects but not "drop a sheet."
- **Effector-based art direction**: keep continuous emission, place collision walls / funnel geometry to channel the fluid into target shapes. This is what we tried for the marble-run idea.
- **Pivot to mesh shape-key animation** for one-shot transforms — fluid sim isn't worth the cost.

---

## Blender 4.4+ Action API drift

The Action data structure changed. Old code that worked:
```python
emitter.animation_data.action.fcurves   # ❌ no longer exists in 4.4+
```

New path:
```python
action = obj.animation_data.action
slot = obj.animation_data.action_slot
channelbag = action.layers[0].strips[0].channelbag(slot)
for fc in channelbag.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'CONSTANT'
```

Wrap in try/except with the legacy fallback for compat:
```python
try:
    fcurves = action.layers[0].strips[0].channelbag(slot).fcurves
except Exception:
    fcurves = action.fcurves  # legacy
```

(See section above — even with CONSTANT interp set correctly, `use_inflow` keyframes don't reliably produce one-shot emission in Mantaflow.)

---

## GPU rendering setup

For Nvidia RTX cards, programmatically:
```python
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'OPTIX'   # OptiX > CUDA on RTX
prefs.get_devices()
for d in prefs.devices:
    d.use = (d.type != 'CPU')          # GPU on, CPU off
bpy.context.scene.cycles.device = 'GPU'
```

OptiX uses RT cores for hardware ray tracing — 5–10× faster than CPU on modern RTX. Adding CPU pegs it at 100% during render so the machine is unusable for daytime iteration; leave CPU off unless overnight.

Reasonable preview settings:
- 64 samples + denoising
- 800×600
- Frame render time on RTX 3050 (laptop): ~30–60 sec at this size

For final overnight pass:
- 256 samples
- Target resolution (1080p or 4K)
- 120 frames × ~4 min/frame ≈ 8 hours on RTX 3050

---

## Viewport screenshot quirks

`mcp__blender__get_viewport_screenshot` can return fully-black images when:
- Viewport in material preview shading on a dark scene with wireframe-only objects
- Blender window minimized or covered
- Tool grabs an empty render buffer

**Don't trust screenshots alone for "is the scene populated."** Use `mcp__blender__get_scene_info` to enumerate objects and their locations. Print modifier states explicitly:

```python
for o in bpy.data.objects:
    print(f"{o.name}: {o.type} @ {tuple(o.location)} | mods={[m.type for m in o.modifiers]}")
```

When you do want a screenshot, switch viewport to **solid shading** + **user perspective** first:
```python
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.region_3d.view_perspective = 'PERSP'
                space.shading.type = 'SOLID'
```

---

## Mantaflow caps and clamps

- **`viscosity_base` clamps silently at 10.0.** Setting 25 has no effect — read it back and it's 10. For thicker visuals, lower scene gravity instead: `bpy.context.scene.gravity = (0, 0, -2.5)`.
- **Surface tension above ~0.2** turns the fluid into rigid blobs that don't deform. Around 0.05–0.15 keeps it cohesive without being solid.
- **`time_scale` 0.4–0.7** is the sweet spot for "controlled slow flow."

---

## Honest path-selection guide for web hero animations

After a multi-hour session attempting Mantaflow for a DS2 hero, the recommendation order:

1. **AI video generation (Veo 3 / Runway / Kling)** — fastest to a usable result. Two keyframes → 5–10 min generation → scrub on web with GSAP. Lower fidelity control, dramatically lower iteration cost. See the `premium-motion-pipeline` skill.
2. **Blender mesh shape-key animation** — sculpt N target meshes, animate between them via shape keys. Fully Python-controllable, predictable, no fluid surprises. Lacks fluid jiggle but is rock-solid.
3. **Blender Mantaflow** — real fluid simulation, gorgeous when working. Reserve for cases where genuine fluid character is non-negotiable AND you have ~6–10 hours of iteration time. Expect to spend half of that fighting bugs, not animating.

Reach for fluid sim only when the alternatives genuinely don't suffice. Otherwise option 1 or 2 ships in a fraction of the time.

---

## Common patterns

### Iterating sim parameters
```
1. Settings change + save (one MCP call)
2. shutil.rmtree on cache subfolders + save (one MCP call)
3. bpy.ops.fluid.bake_all() + save (one MCP call)
4. Render single frame (separate MCP call)
5. Read PNG via Read tool to view result
```

### One-shot emission (when continuous won't do)
For art-directable single-blob effects, prefer:
- **Mesh + shape keys** instead of fluid sim
- Or: keep fluid sim continuous + use effector geometry to confine fluid into target shape
- Avoid: keyframing/driving `use_inflow` (empty caches as documented)

### Long bakes
Always run from Blender's UI bake button when possible. The Python operator wraps the same logic but skips frames in some configurations. UI bake is more reliable.

---

## Reference files

- DS2 Blender experiment: `assets/BLENDER3DANIMATION/test1.blend`
- Cache folders: relative to .blend file, e.g. `cache_blob/` or `cache_grid/`
- Logo source for sims: `apps/ds-site/public/logos/ds2-logo.png`
- Output sequence target (when integrating to web): `apps/ds-site/public/sequences/<name>/frame_NNNN.webp`

## Related skills
- [premium-motion-pipeline](../premium-motion-pipeline/SKILL.md) — Flux + Veo 3 + ffmpeg + GSAP for the AI-video-first path
- [frontend-design](../frontend-design/SKILL.md) — DS brand guardrails when integrating any 3D output to a real web page
