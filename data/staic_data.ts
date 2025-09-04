const mockScanData = {
    nmap_version: "7.97",
    scan_date: "2025-08-28 12:50 +0530",
    host: {
      hostname: "host.docker.internal",
      ip: "192.168.3.23",
      status: "up",
      latency: "0.000061s",
    },
    ports: [
      {
        port: 135,
        protocol: "tcp",
        state: "open",
        service: "msrpc",
        version: "Microsoft Windows RPC",
      },
      {
        port: 139,
        protocol: "tcp",
        state: "open",
        service: "netbios-ssn",
        version: "Microsoft Windows netbios-ssn",
      },
      {
        port: 445,
        protocol: "tcp",
        state: "open",
        service: "microsoft-ds?",
        version: null,
      },
      {
        port: 808,
        protocol: "tcp",
        state: "open",
        service: "mc-nmf",
        version: ".NET Message Framing",
      },
      {
        port: 902,
        protocol: "tcp",
        state: "open",
        service: "ssl/vmware-auth",
        version: "VMware Authentication Daemon 1.10 (Uses VNC, SOAP)",
      },
      {
        port: 912,
        protocol: "tcp",
        state: "open",
        service: "vmware-auth",
        version: "VMware Authentication Daemon 1.0 (Uses VNC, SOAP)",
      },
      {
        port: 2179,
        protocol: "tcp",
        state: "open",
        service: "vmrdp?",
        version: null,
      },
      {
        port: 3389,
        protocol: "tcp",
        state: "open",
        service: "ms-wbt-server",
        version: null,
        extra_info: {
          unrecognized_service_fingerprint: {
            terminal_server_cookie:
              "\\x03\\0\\0\\x13\\x0e\\xd0\\0\\0\\x124\\0\\x02/\\x08\\0\\x02\\0\\0\\0",
          },
        },
      },
      {
        port: 9001,
        protocol: "tcp",
        state: "open",
        service: "http",
        version: "Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)",
      },
    ],
    service_info: {
      os: "Windows",
      cpe: "cpe:/o:microsoft:windows",
    },
  };

export {mockScanData};