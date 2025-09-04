"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {  Shield, Globe, Clock, Server } from "lucide-react";


interface Port {
  port: number
  protocol: string
  state: string
  service: string
  version: string | null
  extra_info?: any
}

interface NetworkScanData {
  nmap_version: string
  scan_date: string
  host: {
    hostname: string
    ip: string
    status: string
    latency: string
  }
  ports: Port[]
  service_info: {
    os: string
    cpe: string
  }
}

export default function ScanDetails({ data, getStateColor }: { data: NetworkScanData; getStateColor: (s: string) => string }) {
  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Host Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Hostname</p>
              <p className="font-mono text-sm">{data.host.hostname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">IP Address</p>
              <p className="font-mono text-sm">{data.host.ip}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={data.host.status === "up" ? "default" : "destructive"}>{data.host.status}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Latency</p>
              <p className="font-mono text-sm">{data.host.latency}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Operating System</p>
              <p className="font-mono text-sm">{data.service_info.os}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">CPE</p>
              <p className="font-mono text-sm break-all">{data.service_info.cpe}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Scan Date</p>
              <p className="font-mono text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {data.scan_date}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Open Ports ({data.ports.length})
          </CardTitle>
          <CardDescription>Discovered services and their versions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.ports.map((port, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {port.port}/{port.protocol}
                    </Badge>
                    <Badge className={getStateColor(port.state)}>{port.state}</Badge>
                  </div>
                  <p className="text-sm font-medium">{port.service}</p>
                </div>

                {port.version && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{port.version}</p>
                  </div>
                )}

                {port.extra_info && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Additional Info</p>
                    <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(port.extra_info, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

     
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Scan performed with Nmap {data.nmap_version}</p>
            <p>{data.ports.length} ports discovered</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}