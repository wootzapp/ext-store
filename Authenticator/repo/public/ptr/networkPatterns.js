const networkPatterns = {
    internalIP: {
        type: "Internal IP Address (IPv4)",
        pattern: XRegExp('\\b(10|192\\.168|172\\.(1[6-9]|2[0-9]|3[0-1]))\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b'),
        
        tags: ["Network", "IP Address", "Internal"]
    },
    externalIP: {
        type: "External IP Address (IPv4)",
        pattern: XRegExp('(?<!\\d)((?!10|192\\.168|172\\.(1[6-9]|2[0-9]|3[0-1]))(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(?!\\d)'),
        
        tags: ["Network", "IP Address", "External"]
    },
    ipv6Address: {
        type: "IPv6 Address",
        pattern: XRegExp('\\b((?:[0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})\\b(?![:-\\w])'),
        
        tags: ["Network", "IP Address", "IPv6"]
    },
    macAddress: {
        type: "MAC Address",
        pattern: XRegExp('\\b([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\\b(?![:-\\w])'),
        
        tags: ["Network", "MAC Address", "Device"]
    },
    deviceHostnames: {
        type: "Device Hostnames",
        pattern: XRegExp('\\b(?:Hostname|Device Hostname|Host|DeviceHostname|HOSTNAME#|Device Hostname#|Host#)\\s*[#: ]\\s*(?!-)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\\.[a-zA-Z]{2,}){1,}\\b', 'i'),
        
        tags: ["Network", "Device", "Hostname"]
    },
    subnetInfo: {
        type: "Subnet Information",
        pattern: XRegExp('\\b(?:Subnet|Netmask|CIDR|Subnet Info|Network)\\s*[:# ]\\s*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\\/(3[0-2]|[1-2]?[0-9])\\b(?![\\d.-])', 'i'),
        
        tags: ["Network", "Subnet", "CIDR"]
    },
    firewallRules: {
        type: "Firewall Rules and Policies",
        pattern: XRegExp('\\b(allow|deny|reject|accept|drop|block|permit|iptable|firewall-rule|fw-rule|acl-entry)\\s+(rule|policy|config|setting)\\b', 'i'),
        
        tags: ["Network", "Security", "Firewall"]
    },
    certsAndKeys: {
        type: "Certificates and Private Keys",
        pattern: XRegExp('-----BEGIN\\s+(CERTIFICATE|PRIVATE\\s+KEY|RSA\\s+PRIVATE\\s+KEY|EC\\s+PRIVATE\\s+KEY)-----[\\r\\n]+([A-Za-z0-9+/=\\r\\n]+)[\\r\\n]+-----END\\s+\\1-----', 'gi'),
        
        tags: ["Security", "Certificate", "Private Key"]
    },
    deviceSerials: {
        type: "Device Serial Numbers",
        pattern: XRegExp('\\b(?:Serial(?:\\s*Number)?|Serial#|SN|S\\/N|SER#|Device Serial(?:\\s*Number)?)\\s*[#: ]\\s*[A-Z0-9-]{8,20}\\b', 'i'),
        
        tags: ["Device", "Serial Number", "Asset"]
    },
    accessControlLists: {
        type: "Access Control Lists (ACLs)",
        pattern: XRegExp('\\bconfig\\s+firewall\\s+acl[6]?\\s+edit\\s+\\d+\\s+set\\s+interface\\s+"[^"]+"\\s+set\\s+srcaddr\\s+"[^"]+"\\s+set\\s+dstaddr\\s+"[^"]+"\\s+set\\s+service\\s+"[^"]+"\\s+next\\s+end\\b'),
        
        tags: ["Network", "Security", "ACL"]
    },
    packetCaptures: {
        type: "Packet Captures (PCAP files)",
        pattern: XRegExp('\\b([\\w-]+)\\.(pcap|pcapng)\\b', 'i'),
        
        tags: ["Network", "Packet Capture", "File"]
    },
    networkLogs: {
        type: "Logs of Network Traffic",
        pattern: XRegExp('\\b(packet|bytes|ip|source|destination|protocol|length|flags|ttl|seq|ack|tcp|udp|transmit|receive|data|latency|throughput)\\s+(log|capture|traffic)\\b', 'i'),
        
        tags: ["Network", "Traffic", "Log"]
    },
    assetTags: {
        type: "Asset Tags",
        pattern: XRegExp('\\b(?:Asset Tag|Asset#|AssetTag|ATAG|Asset)\\s*[#: ]\\s*[A-Z0-9]{8,16}\\b', 'i'),
        
        tags: ["Asset", "Device", "Tag"]
    },
    networkMetadata: {
        type: "Network Metadata (timestamps, size of data transfers, etc.)",
        pattern: XRegExp('\\b(?:Timestamp|Date|Time|Size|Data Transfer)\\s*[:# ]\\s*(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}|\\d{2}:\\d{2}:\\d{2}|\\d+\\s+(bytes|KB|MB|GB|TB))\\b', 'i'),
        
        tags: ["Network", "Metadata", "Data Transfer"]
    },
    sshRSAKey: {
        type: "SSH RSA Key",
        pattern: XRegExp('\\bssh-rsa\\s+[A-Za-z0-9+/=]{20,512}(?:\\s+[\\w@.-]+)?\\b'),
        
        tags: ["Security", "SSH", "Key"]
    },
    sshDSSKey: {
        type: "SSH DSS Key",
        pattern: XRegExp('\\bssh-dss\\s+[A-Za-z0-9+/=]{20,512}(?:\\s+[\\w@.-]+)?\\b'),
        
        tags: ["Security", "SSH", "Key"]
    },
    sshECDSAKey: {
        type: "SSH ECDSA Key",
        pattern: XRegExp('\\becdsa-sha2-nistp256\\s+[A-Za-z0-9+/=]{20,512}(?:\\s+[\\w@.-]+)?\\b'),
        
        tags: ["Security", "SSH", "Key"]
    },
    sshED25519Key: {
        type: "SSH ED25519 Key",
        pattern: XRegExp('\\bssh-ed25519\\s+[A-Za-z0-9+/=]{20,512}(?:\\s+[\\w@.-]+)?\\b'),
        
        tags: ["Security", "SSH", "Key"]
    }
};
