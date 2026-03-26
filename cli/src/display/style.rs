use anstyle::{AnsiColor, Effects, Style};

// ── Styles ────────────────────────────────────────────────────────────────────

// Represents the Active state of a host entry
pub(super) const ACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

// Represents the Inactive state of a host entry
pub(super) const INACTIVE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::DIMMED);

// Represents the IP address of a host entry
pub(super) const IP_STYLE: Style =
    Style::new().fg_color(Some(anstyle::Color::Ansi(AnsiColor::Cyan)));

// Represents the name of a host entry
pub(super) const NAME_STYLE: Style = Style::new().effects(Effects::BOLD);

// Represents a successful operation result (e.g. add, remove, toggle)
// Intentionally matches ACTIVE_STYLE visually — kept separate for semantic clarity
pub(super) const SUCCESS_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Green)))
    .effects(Effects::BOLD);

// Represents an error or failure result (e.g. host not found, invalid input)
pub(super) const ERROR_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Red)))
    .effects(Effects::BOLD);

// Represents a dimmed or secondary text style (e.g. inactive status, IP address)
pub(super) const DIM_STYLE: Style = Style::new().effects(Effects::DIMMED);

// Represents an update notice (e.g. new version available, updating)
pub(super) const NOTICE_STYLE: Style = Style::new()
    .fg_color(Some(anstyle::Color::Ansi(AnsiColor::Yellow)))
    .effects(Effects::BOLD);
