use anstream::eprintln;
use anstream::println;
use anstyle::{AnsiColor, Effects, Style};
use hostcraft_core::{HostEntry, HostStatus};

// ── Styles ────────────────────────────────────────────────────────────────────

const ACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

const INACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::DIMMED);

const IP_STYLE: Style = Style::new().fg_color(Some(anstyle::Color::Ansi(AnsiColor::Cyan)));

const NAME_STYLE: Style = Style::new().effects(Effects::BOLD);

const SUCCESS_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

const ERROR_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::BOLD);

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
            ip = entry.ip.to_string(),
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
