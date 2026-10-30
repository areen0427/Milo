# Milo app

Desktop shell for Milo, built with Tauri 2 (Rust) and React + TypeScript (Vite).

## Run

```sh
cd milo-app
npm install
npm run tauri dev
```

The first run compiles the Rust crates, which takes a minute or two. Later runs are incremental.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run tauri dev` | Starts the Vite dev server on port 1420 and opens the desktop window. |
| `npm run build` | Typechecks and builds the frontend into `dist/`. |
| `npm run typecheck` | TypeScript project check only. |
| `cargo test --manifest-path src-tauri/Cargo.toml` | Rust unit tests. |

## Layout

- Welcome intro: every launch opens on the handwritten wordmark. The outline of "Milo" is traced in orange and filled. It stays until **Open Milo** is pressed, which leaves time for background loading later.
- Workspace: Milo is one persistent agent, so there is a single workspace and no workspace list. The sidebar switches between Chat, Tasks, Goals and Permissions.
- `src/` React frontend: shell layout (titlebar, sidebar, status bar), the views, and the intro in `src/intro/`.
- `src/lib/milo.ts` typed wrappers around the Tauri commands.
- `src-tauri/src/lib.rs` Rust commands: `get_app_info` and `get_service_status`.

## Wordmark and intro font

The intro wordmark is generated from the bundled Yellowtail font (Apache-2.0, see `scripts/fonts/Yellowtail-LICENSE.txt`):

```sh
pip install fonttools brotli
python3 scripts/build-wordmark.py   # writes src/intro/wordmark.generated.ts
```


## Status

The agent service is not built yet. `get_service_status` always reports `not_connected`, and the chat composer does not send messages.

## Versions

The Rust `tauri` crate is pinned to `~2.11.2` to match `@tauri-apps/api` 2.11.x. Keep the two on the same minor version when upgrading. `src-tauri/Cargo.lock` is seeded from the Allora FPGA Tauri lockfile, which is known to build.
