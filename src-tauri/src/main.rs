use tauri::Manager;
use std::fs;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct PasswordEntry {
    id: String,
    website: String,
    username: String,
    password: String,
    category: String,
    #[serde(rename = "lastUpdated")]
    last_updated: String,
}

#[derive(Serialize, Deserialize)]
struct TwoFactorAccount {
    id: String,
    name: String,
    issuer: String,
    secret: String,
    #[serde(rename = "type")]
    type_: String,
    algorithm: String,
    digits: u32,
    period: u32,
}

#[derive(Serialize, Deserialize)]
struct ExportData {
    passwords: Vec<PasswordEntry>,
    two_factor_accounts: Vec<TwoFactorAccount>,
}

#[tauri::command]
fn export_data() -> Result<String, String> {
    let passwords = load_passwords()?;
    let two_factor_accounts = load_two_factor_accounts()?;
    
    let export_data = ExportData {
        passwords,
        two_factor_accounts,
    };
    
    serde_json::to_string(&export_data).map_err(|e| e.to_string())
}

#[tauri::command]
fn import_data(data: ExportData) -> Result<(), String> {
    save_passwords(data.passwords)?;
    save_two_factor_accounts(data.two_factor_accounts)?;
    Ok(())
}

#[tauri::command]
fn load_passwords() -> Result<Vec<PasswordEntry>, String> {
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default()).ok_or("Failed to get app directory")?;
    let file_path = app_dir.join("passwords.json");
    
    if !file_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let passwords: Vec<PasswordEntry> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(passwords)
}

#[tauri::command]
fn save_passwords(passwords: Vec<PasswordEntry>) -> Result<(), String> {
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default()).ok_or("Failed to get app directory")?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let file_path = app_dir.join("passwords.json");
    let content = serde_json::to_string(&passwords).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_two_factor_accounts() -> Result<Vec<TwoFactorAccount>, String> {
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default()).ok_or("Failed to get app directory")?;
    let file_path = app_dir.join("two_factor_accounts.json");
    
    if !file_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let accounts: Vec<TwoFactorAccount> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(accounts)
}

#[tauri::command]
fn save_two_factor_accounts(accounts: Vec<TwoFactorAccount>) -> Result<(), String> {
    let app_dir = tauri::api::path::app_dir(&tauri::Config::default()).ok_or("Failed to get app directory")?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let file_path = app_dir.join("two_factor_accounts.json");
    let content = serde_json::to_string(&accounts).map_err(|e| e.to_string())?;
    fs::write(file_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_file(path: String, contents: String) -> Result<(), String> {
    fs::write(path, contents).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // أي إعداد إضافي
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_passwords,
            save_passwords,
            load_two_factor_accounts,
            save_two_factor_accounts,
            export_data,
            import_data,
            save_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}