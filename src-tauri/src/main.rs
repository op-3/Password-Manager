#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::Manager;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
struct PasswordEntry {
    id: String,
    website: String,
    username: String,
    password: String,
    category: String,
    lastUpdated: String,  // Изменено с last_updated на lastUpdated
}

#[tauri::command]
fn save_passwords(app_handle: tauri::AppHandle, passwords: Vec<PasswordEntry>) -> Result<(), String> {
  let app_dir = app_handle.path_resolver().app_dir().ok_or("Failed to get app directory")?;
  let file_path = app_dir.join("passwords.json");
  
  let json = serde_json::to_string(&passwords).map_err(|e| e.to_string())?;
  fs::write(file_path, json).map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
fn load_passwords(app_handle: tauri::AppHandle) -> Result<Vec<PasswordEntry>, String> {
  let app_dir = app_handle.path_resolver().app_dir().ok_or("Failed to get app directory")?;
  let file_path = app_dir.join("passwords.json");
  
  if !file_path.exists() {
      return Ok(Vec::new());
  }
  
  let json = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
  let passwords: Vec<PasswordEntry> = serde_json::from_str(&json).map_err(|e| e.to_string())?;
  
  Ok(passwords)
}

fn main() {
  tauri::Builder::default()
      .setup(|app| {
          let app_dir = app.path_resolver().app_dir().expect("Failed to get app directory");
          fs::create_dir_all(app_dir).expect("Failed to create app directory");
          Ok(())
      })
      .invoke_handler(tauri::generate_handler![save_passwords, load_passwords])
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}