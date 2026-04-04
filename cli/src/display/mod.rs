mod style;

use anstream::eprintln;
use anstream::println;
use hostcraft_core::{HostEntry, HostStatus};
use style::*;

// ── Print functions ───────────────────────────────────────────────────────────

pub fn print_entries(entries: &[HostEntry]) {
    if entries.is_empty() {
        println!("{DIM_STYLE}No entries found.{DIM_STYLE:#}");
        return;
    }

    for entry in entries {
        let (status_style, symbol) = match entry.status {
            HostStatus::Active => (ACTIVE_STYLE, "●"),
            HostStatus::Inactive => (INACTIVE_STYLE, "○"),
        };

        println!(
            "  {IP_STYLE}{ip:<20}{IP_STYLE:#} {NAME_STYLE}{name:<30}{NAME_STYLE:#} {status_style}{symbol} {status}{status_style:#}",
            ip = entry.ip,
            name = entry.name,
            status = entry.status,
        );
    }
}

pub fn print_success(message: &str) {
    println!("{SUCCESS_STYLE}✓{SUCCESS_STYLE:#} {message}");
}

pub fn print_error(message: &str) {
    eprintln!("{ERROR_STYLE}✗ Error:{ERROR_STYLE:#} {message}");
}

pub fn print_update_notice(latest: &str) {
    println!(
        "\n{NOTICE_STYLE}↑ Update available:{NOTICE_STYLE:#} {DIM_STYLE}v{current}{DIM_STYLE:#} → {NOTICE_STYLE}v{latest}{NOTICE_STYLE:#}",
        current = env!("CARGO_PKG_VERSION"),
    );
    println!("  {DIM_STYLE}Run `hostcraft update` to install.{DIM_STYLE:#}");
}

pub fn print_up_to_date() {
    println!(
        "{SUCCESS_STYLE}✓{SUCCESS_STYLE:#} hostcraft is up to date {DIM_STYLE}(v{}){DIM_STYLE:#}",
        env!("CARGO_PKG_VERSION")
    );
}

pub fn print_updating(latest: &str) {
    println!(
        "{NOTICE_STYLE}↑{NOTICE_STYLE:#} Updating {DIM_STYLE}v{current}{DIM_STYLE:#} → {NOTICE_STYLE}v{latest}{NOTICE_STYLE:#} ...",
        current = env!("CARGO_PKG_VERSION"),
    );
}
