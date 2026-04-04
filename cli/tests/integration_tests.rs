use hostcraft_cli::command::{Cli, Command, run};
use std::fs;

struct TempFile(std::path::PathBuf);

impl TempFile {
    fn new(name: &str) -> Self {
        Self(std::env::temp_dir().join(format!("hostcraft_cli_test_{}.txt", name)))
    }
    fn path_str(&self) -> String {
        self.0.to_string_lossy().to_string()
    }
}

impl Drop for TempFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn make_cli(file: &str, command: Command) -> Cli {
    Cli {
        file: Some(file.to_string()),
        command,
    }
}

fn write_hosts(path: &str, content: &str) {
    fs::write(path, content).unwrap();
}

fn read_hosts(path: &str) -> String {
    fs::read_to_string(path).unwrap()
}

// --- List ---

#[test]
fn list_runs_without_error() {
    let tmp = TempFile::new("list");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(&tmp.path_str(), Command::List));
    assert!(result.is_ok());
}

// --- Add ---

#[test]
fn add_writes_new_entry_to_file() {
    let tmp = TempFile::new("add");
    write_hosts(&tmp.path_str(), "");
    run(make_cli(
        &tmp.path_str(),
        Command::Add {
            name: "myapp.local".to_string(),
            ip: "127.0.0.1".parse().unwrap(),
        },
    ))
    .unwrap();
    assert!(read_hosts(&tmp.path_str()).contains("myapp.local"));
}

#[test]
fn add_duplicate_returns_error() {
    let tmp = TempFile::new("add_duplicate");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(
        &tmp.path_str(),
        Command::Add {
            name: "alpha.com".to_string(),
            ip: "127.0.0.1".parse().unwrap(),
        },
    ));
    assert!(result.is_err());
}

// --- Edit ---

#[test]
fn edit_updates_entry_in_file() {
    let tmp = TempFile::new("edit");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    run(make_cli(
        &tmp.path_str(),
        Command::Edit {
            old_name: "alpha.com".to_string(),
            new_ip: Some("10.0.0.1".parse().unwrap()),
            new_name: Some("new-alpha.com".to_string()),
        },
    ))
    .unwrap();
    let content = read_hosts(&tmp.path_str());
    assert!(content.contains("new-alpha.com"));
    assert!(content.contains("10.0.0.1"));
    assert!(!content.contains("127.0.0.1 alpha.com"));
}

#[test]
fn edit_with_no_flags_returns_error() {
    let tmp = TempFile::new("edit_no_flags");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(
        &tmp.path_str(),
        Command::Edit {
            old_name: "alpha.com".to_string(),
            new_ip: None,
            new_name: None,
        },
    ));
    assert!(result.is_err());
}

#[test]
fn edit_nonexistent_entry_returns_error() {
    let tmp = TempFile::new("edit_not_found");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(
        &tmp.path_str(),
        Command::Edit {
            old_name: "notexist.com".to_string(),
            new_ip: Some("10.0.0.1".parse().unwrap()),
            new_name: None,
        },
    ));
    assert!(result.is_err());
}

// --- Remove ---

#[test]
fn remove_exact_removes_entry() {
    let tmp = TempFile::new("remove_exact");
    write_hosts(
        &tmp.path_str(),
        "127.0.0.1 alpha.com\n192.168.0.1 beta.com\n",
    );
    run(make_cli(
        &tmp.path_str(),
        Command::Remove {
            name: "alpha.com".to_string(),
            partial: false,
        },
    ))
    .unwrap();
    let content = read_hosts(&tmp.path_str());
    assert!(!content.contains("alpha.com"));
    assert!(content.contains("beta.com"));
}

#[test]
fn remove_partial_removes_all_matching() {
    let tmp = TempFile::new("remove_partial");
    write_hosts(
        &tmp.path_str(),
        "127.0.0.1 dev-cloud.seliseblocks.com\n127.0.0.1 cloud.seliselocal.com\n127.0.0.1 unrelated.com\n",
    );
    run(make_cli(
        &tmp.path_str(),
        Command::Remove {
            name: "cloud".to_string(),
            partial: true,
        },
    ))
    .unwrap();
    let content = read_hosts(&tmp.path_str());
    assert!(!content.contains("dev-cloud.seliseblocks.com"));
    assert!(!content.contains("cloud.seliselocal.com"));
    assert!(content.contains("unrelated.com"));
}

#[test]
fn remove_exact_does_not_match_substring() {
    let tmp = TempFile::new("remove_no_substring");
    write_hosts(
        &tmp.path_str(),
        "127.0.0.1 dev-cloud.seliseblocks.com\n127.0.0.1 cloud.seliselocal.com\n",
    );
    // exact remove of "cloud.seliselocal.com" should NOT remove "dev-cloud.seliseblocks.com"
    run(make_cli(
        &tmp.path_str(),
        Command::Remove {
            name: "cloud.seliselocal.com".to_string(),
            partial: false,
        },
    ))
    .unwrap();
    let content = read_hosts(&tmp.path_str());
    assert!(content.contains("dev-cloud.seliseblocks.com"));
    assert!(!content.contains("cloud.seliselocal.com"));
}

#[test]
fn remove_nonexistent_returns_error() {
    let tmp = TempFile::new("remove_not_found");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(
        &tmp.path_str(),
        Command::Remove {
            name: "notexist.com".to_string(),
            partial: false,
        },
    ));
    assert!(result.is_err());
}

// --- Toggle ---

#[test]
fn toggle_exact_toggles_single_entry() {
    let tmp = TempFile::new("toggle_exact");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    run(make_cli(
        &tmp.path_str(),
        Command::Toggle {
            name: "alpha.com".to_string(),
            partial: false,
        },
    ))
    .unwrap();
    assert!(read_hosts(&tmp.path_str()).contains("# 127.0.0.1 alpha.com"));
}

#[test]
fn toggle_partial_toggles_all_matching() {
    let tmp = TempFile::new("toggle_partial");
    write_hosts(
        &tmp.path_str(),
        "127.0.0.1 dev-cloud.seliseblocks.com\n127.0.0.1 cloud.seliselocal.com\n127.0.0.1 unrelated.com\n",
    );
    run(make_cli(
        &tmp.path_str(),
        Command::Toggle {
            name: "cloud".to_string(),
            partial: true,
        },
    ))
    .unwrap();
    let content = read_hosts(&tmp.path_str());
    assert!(content.contains("# 127.0.0.1 dev-cloud.seliseblocks.com"));
    assert!(content.contains("# 127.0.0.1 cloud.seliselocal.com"));
    assert!(!content.contains("# 127.0.0.1 unrelated.com"));
}

#[test]
fn toggle_nonexistent_returns_error() {
    let tmp = TempFile::new("toggle_not_found");
    write_hosts(&tmp.path_str(), "127.0.0.1 alpha.com\n");
    let result = run(make_cli(
        &tmp.path_str(),
        Command::Toggle {
            name: "notexist.com".to_string(),
            partial: false,
        },
    ));
    assert!(result.is_err());
}
