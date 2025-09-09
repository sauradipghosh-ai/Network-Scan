import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import * as xml2js from "xml2js";

const execAsync = promisify(exec);

interface NmapPort {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string | null;
}

interface NmapResult {
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

function parseNmapXML(xmlData: string): NmapResult {
  let result: NmapResult;
  
  xml2js.parseString(xmlData, { explicitArray: false }, (err, parsed) => {
    if (err) {
      throw new Error(`XML parsing error: ${err.message}`);
    }

    const nmaprun = parsed.nmaprun;
    const host = nmaprun.host;
    

    const hostInfo = {
      hostname: "",
      ip: "",
      status: "down",
      latency: "0s"
    };

   
    if (host.address) {
      const addresses = Array.isArray(host.address) ? host.address : [host.address];
      const ipv4 = addresses.find((addr: any) => addr.$.addrtype === "ipv4");
      if (ipv4) {
        hostInfo.ip = ipv4.$.addr;
      }
    }

   
    if (host.hostnames && host.hostnames.hostname) {
      const hostnames = Array.isArray(host.hostnames.hostname) 
        ? host.hostnames.hostname 
        : [host.hostnames.hostname];
      if (hostnames.length > 0) {
        hostInfo.hostname = hostnames[0].$.name;
      }
    }

   
    if (host.status) {
      hostInfo.status = host.status.$.state;
    }

    
    if (host.times) {
      hostInfo.latency = `${host.times.$.rttvar}s`;
    }

    
    const ports: NmapPort[] = [];
    if (host.ports && host.ports.port) {
      const portList = Array.isArray(host.ports.port) ? host.ports.port : [host.ports.port];
      
      for (const port of portList) {
        const portInfo: NmapPort = {
          port: parseInt(port.$.portid),
          protocol: port.$.protocol,
          state: port.state.$.state,
          service: "",
          version: null
        };

        
        if (port.service) {
          portInfo.service = port.service.$.name || "";
          if (port.service.$.product || port.service.$.version) {
            portInfo.version = `${port.service.$.product || ""} ${port.service.$.version || ""}`.trim();
          }
        }

        ports.push(portInfo);
      }
    }

    
    let osInfo = "Unknown";
    let cpeInfo = "";
    
    if (host.os && host.os.osmatch) {
      const osMatches = Array.isArray(host.os.osmatch) ? host.os.osmatch : [host.os.osmatch];
      if (osMatches.length > 0) {
        osInfo = osMatches[0].$.name;
        if (osMatches[0].osclass && osMatches[0].osclass.cpe) {
          cpeInfo = osMatches[0].osclass.cpe;
        }
      }
    }

    result = {
      nmap_version: nmaprun.$.version,
      scan_date: new Date().toISOString(),
      host: hostInfo,
      ports: ports,
      service_info: {
        os: osInfo,
        cpe: cpeInfo
      }
    };
  });

  return result!;
}

async function runNmapScan(target: string): Promise<NmapResult> {
  const nmapPath = '"C:\\Program Files (x86)\\Nmap\\nmap.exe"';
  const command = `${nmapPath} -sV -sC -O -oX - ${target}`;
  
  try {
    console.log(`Running nmap command: ${command}`);
    const { stdout, stderr } = await execAsync(command, { 
      // add the time limt max 3 min and max memory buffer 10 MB
      timeout: 300000, 
      maxBuffer: 1024 * 1024 * 10 
    });
    
    if (stderr && !stderr.includes('Warning:')) {
      console.warn(`Nmap stderr: ${stderr}`);
    }
    
    console.log("Nmap scan completed, parsing XML...");
    return parseNmapXML(stdout);
  } catch (error: any) {
    console.error("Nmap execution error:", error);
    throw new Error(`Nmap scan failed: ${error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const { target } = await req.json();
    
    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    console.log(`Starting nmap scan for target: ${target}`);
    
    
    const scanData = await runNmapScan(target);
    
    console.log("Nmap scan completed, saving to database...");

    
    const scan = await prisma.scan.create({
      data: {
        ip: scanData.host.ip,
        hostname: scanData.host.hostname || null,
        status: scanData.host.status,
        scanDate: new Date(scanData.scan_date),
        ports: {
          create: scanData.ports.map((p) => ({
            port: p.port,
            protocol: p.protocol,
            state: p.state,
            service: p.service,
            version: p.version,
          })),
          
        },
        // serviceInfo: {
        //     os: scanData.os,
        //     cpe : scanData.cpe,
        //   },
      },
      include: { ports: true },
    });

    console.log("Scan saved to database successfully");
    return NextResponse.json({ scanData, dbScan: scan }, { status: 201 });
  } catch (error: any) {
    console.error("Error in scan API:", error);
    return NextResponse.json({ 
      error: "Failed to perform scan", 
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  const scans = await prisma.scan.findMany({
    include: { ports: true },
    orderBy: { scanDate: "desc" },
  });

  return NextResponse.json(scans);
}