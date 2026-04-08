fn main() {
    let mut attributes = tauri_build::Attributes::new();

    #[cfg(target_os = "windows")]
    {
        attributes = attributes.windows_attributes(
            tauri_build::WindowsAttributes::new().app_manifest(include_str!("app.manifest")),
        );
    }

    tauri_build::try_build(attributes).expect("failed to run tauri-build");
}
