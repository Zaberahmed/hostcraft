mod utils;
use crate::file::utils::write_entries;
use crate::host::HostEntry;
use std::{
    fs::File,
    io::{self, BufRead},
    path::Path,
};

pub fn read_file<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}

pub fn write_file<P>(filename: P, entries: &[HostEntry]) -> io::Result<()>
where
    P: AsRef<Path>,
{
    let mut file = File::create(filename)?;
    write_entries(entries, &mut file)?;
    Ok(())
}
