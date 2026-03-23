mod command;
mod display;

use clap::Parser;
use command::{Cli, run};
use display::print_error;
use std::process;

fn main() {
    let cli = Cli::parse();

    if let Err(e) = run(cli) {
        print_error(&e.to_string());
        process::exit(1);
    }
}
