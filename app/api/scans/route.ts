import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";

import {NmapPort, NmapResult} from "@/app/api/scans/nmap_type";

const execAsync = promisify(exec);


function covertText(text: string): NmapResult {

  const lines = text.split("\n").map(l => l.trim());
  
  let nmap_version = "";
  let scan_date = "";

  const host: any = { 

    hostname: "", 
    ip: "", 
    status: "",
    latency: "" 
  };

  const ports: NmapPort[] = [];

  let service_info = { os: "", cpe: "" };

  for (const l of lines) {

    if (l.startsWith("Starting Nmap")) {

      const match = l.match(/^Starting Nmap\s+([\d.]+)/); // i got the nmap version no

      if (match){
        nmap_version = match[1];
      } 

      const datePart = l.split("at")[1]?.trim();

      if (datePart){
        scan_date = datePart;
      } 

    }

    if (l.startsWith("Nmap scan report for")) {

      const parts = l.replace("Nmap scan report for", "").trim().split(" ");

      if (parts.length === 1) {

        host.ip = parts[0];

      } else {

        host.hostname = parts[0];
        host.ip = parts[1].replace(/[()]/g, "");

      }
    }

    if (l.startsWith("Host is up")) {

      host.status = "up";
      
    }

    const portMatch = l.match(/^(\d+)\/(\w+)\s+(\w+)\s+(\S+)(.*)$/);
    if (portMatch) {

      const [,port, protocol, state, service, version] = portMatch;

      ports.push(
        {
          port: parseInt(port),
          protocol,
          state,
          service,
          version: version.trim() || null,
        }
      );

    }
  }

  return {

    nmap_version,
    scan_date,
    host,
    ports,
    service_info,
    
  };
}

async function runNmapScan(target: string): Promise<NmapResult> {

  const nmapPath = '"C:\\Program Files (x86)\\Nmap\\nmap.exe"';

  const command = `${nmapPath} -sV -O ${target}`;

  try {
    console.log(`Run the nmap command: ${command}`);
    
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.log(`stderr data: ${stderr}`);
    }

    console.log("scan Data :", stdout);

    return covertText(stdout);

  } catch (error: any) {

    console.log("execute Error:", error);
    throw new Error(`Error scan failed: ${error.message}`);
  }
}

export async function POST(req: Request) {

  try {
  
    const { target } = await req.json();
    

    if (!target) {
      return NextResponse.json({ error: "Target is required pls pass the traget value" }, { status: 400 });
    }

    console.log(`Nmap scan start for this target: ${target}`);
    
    
    const scanData = await runNmapScan(target);

    
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
      },
      include: { ports: true },
    });

    console.log("Scan Data save successfully !");
    return NextResponse.json({ scanData, dbScan: scan }, { status: 201 });

  } catch (error: any) {
    
    console.error("Error scan API:", error);
    
    return NextResponse.json({ 
      error: "Failed in scan", 
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