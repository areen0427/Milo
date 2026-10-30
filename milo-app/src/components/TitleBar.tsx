export default function TitleBar() {
  // The whole bar is the drag region; it contains no interactive controls.
  return (
    <header className="titlebar" data-tauri-drag-region>
      <span className="titlebar-title" data-tauri-drag-region>
        MILO
      </span>
    </header>
  );
}
