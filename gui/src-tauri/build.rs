fn main() {
    #[cfg(target_os = "windows")]
    {
        let mut res = winresource::WindowsResource::new();
        res.set_manifest_file("app.manifest");
        res.compile().unwrap();
    }
    tauri_build::build()
}
