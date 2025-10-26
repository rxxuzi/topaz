#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
async fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
async fn open_file_dialog(_app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri::api::dialog::FileDialogBuilder;
    
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("Text Files", &["txt", "md", "json", "rs", "py", "js", "ts"])
        .add_filter("All Files", &["*"])
        .pick_file(move |file_path| {
            tx.send(file_path).unwrap();
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Dialog error: {}", e)),
    }
}

#[tauri::command]
async fn save_file_dialog(_app_handle: tauri::AppHandle) -> Result<Option<String>, String> {
    use tauri::api::dialog::FileDialogBuilder;
    
    let (tx, rx) = std::sync::mpsc::channel();
    
    FileDialogBuilder::new()
        .add_filter("Text Files", &["txt", "md", "json"])
        .save_file(move |file_path| {
            tx.send(file_path).unwrap();
        });
    
    match rx.recv() {
        Ok(Some(path)) => Ok(Some(path.to_string_lossy().to_string())),
        Ok(None) => Ok(None),
        Err(e) => Err(format!("Dialog error: {}", e)),
    }
}

fn handle_cli_args() -> Option<PathBuf> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() > 1 {
        Some(PathBuf::from(&args[1]))
    } else {
        None
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(file_path) = handle_cli_args() {
                if file_path.exists() {
                    let path_str = file_path.to_string_lossy().to_string();
                    app.get_window("main").unwrap().emit("open-file", path_str).ok();
                }
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            open_file_dialog,
            save_file_dialog
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
