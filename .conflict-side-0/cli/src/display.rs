use anstream::eprintln;
use anstream::println;
use anstyle::{AnsiColor, Effects, Style};
use hostcraft_core::{HostEntry, HostStatus};

// ── Styles ────────────────────────────────────────────────────────────────────

// Represents the Active state of a host entry
const ACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

// Represents the Inactive state of a host entry
const INACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::DIMMED);

// Represents the IP address of a host entry
const IP_STYLE: Style = Style::new().fg_color(Some(anstyle::Color::Ansi(AnsiColor::Cyan)));

// Represents the name of a host entry
const NAME_STYLE: Style = Style::new().effects(Effects::BOLD);

// Represents a successful operation result (e.g. add, remove, toggle)
// Intentionally matches ACTIVE_STYLE visually — kept separate for semantic clarity
const SUCCESS_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

// Represents an error or failure result (e.g. host not found, invalid input)
const ERROR_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::BOLD);

// Represents a dimmed or secondary text style (e.g. inactive status, IP address)
const DIM_STYLE: Style = Style::new().effects(Effects::DIMMED);

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
