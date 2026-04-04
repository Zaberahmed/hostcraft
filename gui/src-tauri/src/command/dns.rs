use std::net::IpAddr;

#[derive(serde::Serialize)]
pub struct DnsValidationResult {
    pub conflict: bool,
    pub lookup_failed: bool,
    pub resolved_ips: Vec<String>,
}

#[tauri::command]
pub fn validate_dns(hostname: String, ip: IpAddr) -> Result<DnsValidationResult, String> {
    use std::net::ToSocketAddrs;

    let lookup = (hostname.as_str(), 0).to_socket_addrs();
    let addrs = match lookup {
        Ok(a) => a,
        Err(_) => {
            return Ok(DnsValidationResult {
                conflict: false,
                lookup_failed: true,
                resolved_ips: vec![],
            });
        }
    };

    let mut ips: Vec<IpAddr> = addrs.map(|a| a.ip()).collect();
    ips.sort();
    ips.dedup();

    Ok(DnsValidationResult {
        conflict: !ips.is_empty() && !ips.contains(&ip),
        lookup_failed: false,
        resolved_ips: ips.into_iter().map(|x| x.to_string()).collect(),
    })
}
