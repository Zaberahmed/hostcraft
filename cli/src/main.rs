mod command;
mod display;
mod update;

use clap::Parser;
use command::{Cli, Command, run};
use display::{print_error, print_update_notice};
use std::process;

fn main() {
    let cli = Cli::parse();

    let update_check = (!matches!(cli.command, Command::Update)).then(update::check_for_update);

    if let Err(e) = run(cli) {
        print_error(&e.to_string());
        process::exit(1);
    }

    if let Some(check) = update_check {
        if let Some(latest) = check() {
            print_update_notice(&latest);
        }
    }
}
