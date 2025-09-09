
export interface NmapPort {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string | null;
}

export interface NmapResult {
  nmap_version: string;
  scan_date: string;
  host: {
    hostname: string;
    ip: string;
    status: string;
    latency: string;
  };
  ports: NmapPort[];
  service_info: {
    os: string;
    cpe: string;
  };
}

