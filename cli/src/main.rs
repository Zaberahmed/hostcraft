mod command;
use ::clap::Parser;
use command::{Cli, run};
use std::process;

fn main() {
    let cli = Cli::parse();

    if let Err(e) = run(cli) {
        eprintln!("Error: {}", e);
        process::exit(1);
    }
}
