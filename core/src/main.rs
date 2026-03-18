use hostcraft::file;
use hostcraft::host;
use std::net::Ipv4Addr;

fn main() {
    let lines = file::read_file("hosts-copy").expect("Error while reading hosts file");
    let mut entries = host::parse_contents(lines);
    //Print entries before:
    // host::print_entries(&entries);
    //
    // Toggle specific entry (commented out):
    // host::toggle_entry(&mut entries, "testing.hostcraft.com").expect("Error while toggling entry");
    //
    // Add a new entry (commented out):
    host::add_entry(
        &mut entries,
        std::net::IpAddr::V4(Ipv4Addr::new(255, 255, 255, 0)),
        String::from("testing.hostcraft.com"),
    )
    .expect("Error while adding entry");
    // Remove an entry (commented out):
    // host::remove_entry(&mut entries, "testing.hostcraft.com").expect("Error while removing entry");

    file::write_file("hosts-copy", &entries).expect("Error while writing hosts file");
    host::print_entries(&entries);
}
