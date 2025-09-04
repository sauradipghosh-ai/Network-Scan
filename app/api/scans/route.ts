import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const data = await req.json();

    const scan = await prisma.scan.create({
      data: {
        ip: data.host.ip,
        hostname: data.host.hostname,
        status: data.host.status,
        scanDate: new Date(data.scan_date),
        ports: {
          create: data.ports.map((p: any) => ({
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

    return NextResponse.json(scan, { status: 201 });
  } catch (error) {
    console.error("Error saving scan:", error);
    return NextResponse.json({ error: "Failed to save scan" }, { status: 500 });
  }
}

export async function GET() {
  const scans = await prisma.scan.findMany({
    include: { ports: true  },
    orderBy: { scanDate: "desc" },
  });

  return NextResponse.json(scans);
}



// export function GET(){
//   console.log("Running Get Route Handeler !");
//   return new Response(JSON.stringify({ message : "Hello World !"}));
// }