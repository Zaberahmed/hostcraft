mod utils;

use crate::display::{print_entries, print_success};
use clap::{Parser, Subcommand};
use hostcraft_core::{HostError, file, host};
use std::{error::Error, net::IpAddr};
use utils::write_hosts;

const HOSTS_FILE: &str = if cfg!(target_os = "windows") {
    r"C:\Windows\System32\drivers\etc\hosts"
} else {
    "/etc/hosts"
};

#[derive(Parser)]
#[command(
    name = "hostcraft",
    about = "Manage your system hosts file from the terminal",
    version
)]
pub struct Cli {
    /// Path to the hosts file (override for testing or non-standard setups)
    #[arg(long, default_value = HOSTS_FILE)]
    pub file: String,

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
}

pub fn run(cli: Cli) -> Result<(), Box<dyn Error>> {
    let lines = file::read_file(&cli.file)
        .map_err(|e| format!("Failed to read hosts file '{}': {}", cli.file, e))?;

    let mut entries = host::parse_contents(lines);

    match cli.command {
        Command::List => {
            print_entries(&entries);
        }

        Command::Add { name, ip } => {
            host::add_entry(&mut entries, ip, name.as_str()).map_err(|e| match e {
                HostError::DuplicateEntry => format!("Entry already exists. {}", e),
                _ => format!("Failed to add entry: {}", e),
            })?;

            write_hosts(&cli.file, &entries)?;

            print_success(&format!("Added '{}'", name));
            print_entries(&entries);
        }

        Command::Remove { name } => {
            host::remove_entry(&mut entries, &name).map_err(|e| match e {
                HostError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
                _ => format!("Failed to remove entry: {}", e),
            })?;

            write_hosts(&cli.file, &entries)?;

            print_success(&format!("Removed '{}'", name));
            print_entries(&entries);
        }

        Command::Toggle { name } => {
            host::toggle_entry(&mut entries, &name).map_err(|e| match e {
                HostError::EntryNotFound => format!("No entry found matching '{}'. {}", name, e),
                _ => format!("Failed to toggle entry: {}", e),
            })?;

            write_hosts(&cli.file, &entries)?;

            print_success(&format!("Toggled '{}'", name));
            print_entries(&entries);
        }
    }

    Ok(())
}
