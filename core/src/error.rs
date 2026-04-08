use std::fmt;

#[derive(Debug)]
pub enum HostCraftError {
    Io(std::io::Error),
    PermissionDenied(String),
    UnsupportedPlatform(String),
    DuplicateEntry,
    EntryNotFound,
    NoChange,
}

impl fmt::Display for HostCraftError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            HostCraftError::Io(e) => write!(f, "IO error: {}", e),
            HostCraftError::PermissionDenied(msg) => write!(f, "{}", msg),
            HostCraftError::UnsupportedPlatform(os) => write!(f, "Unsupported platform: {}", os),
            HostCraftError::DuplicateEntry => write!(f, "You have inserted a duplicate entry."),
            HostCraftError::EntryNotFound => write!(f, "Please check the name and try again."),
            HostCraftError::NoChange => {
                write!(f, "Entry already exists. No changes made.")
            }
        }
    }
}

impl std::error::Error for HostCraftError {}

pub type Result<T> = std::result::Result<T, HostCraftError>;
