use crate::display::{print_entries, print_success};
use clap::{Parser, Subcommand};
use hostcraft_core::{HostCraftError, file, host, platform::write_hosts_to};
use std::{error::Error, net::IpAddr, path::PathBuf};

#[derive(Parser)]
#[command(
    name = "hostcraft",
    about = "Manage your system hosts file from the terminal",
    version
)]
pub struct Cli {
    /// Path to the hosts file (override for testing or non-standard setups)
    #[arg(long)]
    pub file: Option<String>,

    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    /// List all host entries
    List,

    /// Add a new host entry
    Add {
        /// The hostname to add (e.g. myapp.local)
        name: String,

        /// The IP address to associate with the hostname (e.g. 127.0.0.1)
        ip: IpAddr,
    },

    /// Edit a host entry (full match supported)
    Edit {
        /// The hostname to edit (e.g. myapp.local)
        old_name: String,

        /// The new ip address (e.g. 127.0.0.1)
        #[arg(long)]
        new_ip: Option<IpAddr>,

        /// The new hostname (e.g. myapp.local)
        #[arg(long)]
        new_name: Option<String>,
    },

    /// Remove a host entry by name (partial match supported)
    Remove {
        /// The hostname to remove (partial match supported)
        name: String,
    },

    /// Toggle a host entry on or off by name (partial match supported)
    Toggle {
        /// The hostname to toggle (partial match supported)
        name: String,
    },

    /// Check for a newer version and update if one is available
    Update,
}

pub fn run(cli: Cli) -> Result<(), Box<dyn Error>> {
    if matches!(cli.command, Command::Update) {
        return crate::update::handle_update();
    }

    let path = match cli.file {
        Some(ref p) => PathBuf::from(p),
        None => hostcraft_core::platform::get_hosts_path().map_err(|e| e.to_string())?,
    };

    let lines = file::read_file(&path)
        .map_err(|e| format!("Failed to read hosts file '{}': {}", path.display(), e))?;

    let mut entries = host::parse_contents(lines);

    match cli.command {
        Command::List => {
            print_entries(&entries);
        }

        Command::Add { name, ip } => {
            host::add_entry(&mut entries, ip, name.as_str()).map_err(|e| match e {
                HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
                _ => format!("Failed to add entry: {}", e),
            })?;

            write_hosts_to(&path, &entries).map_err(|e| e.to_string())?;

            print_success(&format!("Added '{}'", name));
            print_entries(&entries);
        }

        Command::Edit {
            old_name,
            new_ip,
            new_name,
        } => {
            if new_ip.is_none() && new_name.is_none() {
                return Err("Provide at least one of --new_ip or --new_name".into());
            }

            let (current_ip, current_name) = entries
                .iter()
                .find(|e| e.name == old_name)
                .map(|e| (e.ip, e.name.clone()))
                .ok_or_else(|| format!("No entry found with exact name '{}'.", old_name))?;

            let resolved_ip = new_ip.unwrap_or(current_ip);
            let resolved_name = new_name.as_deref().unwrap_or(&current_name);

            host::edit_entry(&mut entries, &old_name, resolved_ip, resolved_name).map_err(|e| {
                match e {
                    HostCraftError::EntryNotFound => {
                        format!("No entry found with exact name '{}'. {}", old_name, e)
                    }
                    HostCraftError::DuplicateEntry => format!("Entry already exists. {}", e),
                    HostCraftError::NoChange => format!("No changes made to entry '{}'.", old_name),
                    _ => format!("Failed to edit entry: {}", e),
                }
            })?;

            write_hosts_to(&path, &entries).map_err(|e| e.to_string())?;

            print_success(&format!("Edited '{}'", old_name));
            print_entries(&entries);
        }

        Command::Remove { name } => {
            host::remove_entry(&mut entries, &name).map_err(|e| match e {
                HostCraftError::EntryNotFound => {
                    format!("No entry found matching '{}'. {}", name, e)
                }
                _ => format!("Failed to remove entry: {}", e),
            })?;

            write_hosts_to(&path, &entries).map_err(|e| e.to_string())?;

            print_success(&format!("Removed '{}'", name));
            print_entries(&entries);
        }

        Command::Toggle { name } => {
            host::toggle_entry(&mut entries, &name).map_err(|e| match e {
                HostCraftError::EntryNotFound => {
                    format!("No entry found matching '{}'. {}", name, e)
                }
                _ => format!("Failed to toggle entry: {}", e),
            })?;

            write_hosts_to(&path, &entries).map_err(|e| e.to_string())?;

            print_success(&format!("Toggled '{}'", name));
            print_entries(&entries);
        }

        Command::Update => unreachable!("handled above"),
    }

    Ok(())
}
