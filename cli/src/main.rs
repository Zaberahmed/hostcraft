use hostcraft_core::{file, host};
use std::env;
use std::net::Ipv4Addr;

fn main() {
    let args: Vec<String> = env::args_os()
        .into_iter()
        .map(|a| a.into_string().unwrap())
        .collect();
    // let program_name = args.first().cloned().unwrap_or_default();
    let arguments: Vec<String> = args.into_iter().skip(1).collect();
    // println!("Program: {}", program_name);
    println!("Arguments: {:?}", arguments);

    let lines = file::read_file("hosts-copy").expect("Error while reading hosts file");
    let entries = host::parse_contents(lines);

    if arguments[0] == "list" {
        host::print_entries(&entries);
    } else if arguments[0] == "add" {
        let mut entries = entries;
        let ip: Ipv4Addr = arguments[2].parse().unwrap();
        host::add_entry(
            &mut entries,
            std::net::IpAddr::V4(ip),
            String::from(arguments[1].clone()),
        )
        .expect("Error while adding entry");
        file::write_file("hosts-copy", &entries).expect("Error while writing hosts file");
        host::print_entries(&entries);
    } else if arguments[0] == "remove" {
        let mut entries = entries;
        host::remove_entry(&mut entries, &arguments[1]).expect("Error while removing entry");
        file::write_file("hosts-copy", &entries).expect("Error while writing hosts file");
        host::print_entries(&entries);
    } else {
        let mut entries = entries;
        host::toggle_entry(&mut entries, &arguments[1]).expect("Error while toggling entry");
        file::write_file("hosts-copy", &entries).expect("Error while writing hosts file");
        host::print_entries(&entries);
    }
}
