fn main() {
    // Icons are embedded in the binary (including the macOS dev Dock icon),
    // so changing them must trigger a rebuild.
    println!("cargo:rerun-if-changed=icons");
    tauri_build::build()
}
