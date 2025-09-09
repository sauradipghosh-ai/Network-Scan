"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Eye } from "lucide-react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import ScanDetails from "@/components/scan_details";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Port {
   port: number;
   protocol: string;
   state: string;
   service: string;
   version: string | null;
   extra_info?: any;
}

interface NetworkScanData {
   nmap_version: string;
   scan_date: string;
   host: {
      hostname: string;
      ip: string;
      status: string;
      latency: string;
   };
   ports: Port[];
   service_info: {
      os: string;
      cpe: string;
   };
}

interface DatabaseScan {
   id: number;
   ip: string;
   hostname: string | null;
   status: string;
   scanDate: string;
   ports: {
      id: number;
      port: number;
      protocol: string;
      state: string;
      service: string;
      version: string | null;
      scanId: number;
   }[];
}

type SavedScan = { id: string; target: string; data: NetworkScanData };

export default function NetworkScannerPage() {
   const [targetInput, setTargetInput] = useState("");
   const [scanData, setScanData] = useState<NetworkScanData | null>(null);
   const [isScanning, setIsScanning] = useState(false);
   const [openDialog, setOpenDialog] = useState(false);
   const [selectedPort, setSelectedPort] = useState<Port | null>(null);
   const [scanError, setScanError] = useState<string | null>(null);

   const [scans, setScans] = useState<SavedScan[]>([]);
   const [previewOpen, setPreviewOpen] = useState(false);
   const [selectedScan, setSelectedScan] = useState<NetworkScanData | null>(
      null
   );
   const [isLoading, setIsLoading] = useState(true);

   const genId = () =>
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
   const getOpenPortsCount = (data: NetworkScanData) =>
      data.ports.filter((p) => p.state.toLowerCase() === "open").length;

   
   useEffect(() => {
      fetchScans();
   }, []);

   const fetchScans = async () => {
      try {
         setIsLoading(true);
         const response = await fetch("/api/scans");
         if (response.ok) {
            const dbScans: DatabaseScan[] = await response.json();

            
            const convertedScans: SavedScan[] = dbScans.map((dbScan) => ({
               id: dbScan.id.toString(),
               target: dbScan.hostname || dbScan.ip,
               data: {
                  nmap_version: "7.97",
                  scan_date: dbScan.scanDate,
                  host: {
                     hostname: dbScan.hostname || "",
                     ip: dbScan.ip,
                     status: dbScan.status,
                     latency: "0.000061s",
                  },
                  ports: dbScan.ports,
                  service_info: {
                     os: "Unknown",
                     cpe: "",
                  },
               },
            }));

            setScans(convertedScans);
         }
      } catch (error) {
         console.error("Error fetching scans:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const performNmapScan = async (
      target: string
   ): Promise<NetworkScanData | null> => {
      try {
         const response = await fetch("/api/scans", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ target }),
         });

         if (response.ok) {
            const result = await response.json();
            console.log("Nmap scan completed successfully");
            return result.scanData;
         } else {
            const errorData = await response.json();
            throw new Error(
               errorData.details || errorData.error || "Scan failed"
            );
         }
      } catch (error: any) {
         console.error("Error performing nmap scan:", error);
         throw error;
      }
   };

   const handleScan = async () => {
      if (!targetInput.trim()) return;

      setIsScanning(true);
      setScanError(null);
      const target = targetInput.trim();

      try {
         
         const scanResult = await performNmapScan(target);

         if (scanResult) {
            setScanData(scanResult);
            await fetchScans();
         }
      } catch (error: any) {
         console.error("Error during scan:", error);
         setScanError(error.message || "An error occurred during the scan");
      } finally {
         setIsScanning(false);
      }
   };

   const getStateColor = (state: string) => {
      switch (state.toLowerCase()) {
         case "open":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
         case "closed":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
         case "filtered":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
         default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      }
   };

   const handlePortClick = (port: Port) => {
      setSelectedPort(port);
      setOpenDialog(true);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
   };

   const handlePreviewClick = (scan: NetworkScanData) => {
      setSelectedScan(scan);
      setPreviewOpen(true);
   };

   const handleClosePreview = () => {
      setPreviewOpen(false);
   };

   return (
      <div className="min-h-screen bg-background p-6">
         <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
               <h1 className="text-3xl font-bold text-balance">
                  Network Scanner
               </h1>
               <p className="text-muted-foreground text-pretty">
                  Discover open ports and services on network hosts
               </p>
            </div>

            <Card className="max-w-2xl mx-auto">
               <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                     <Search className="h-5 w-5" />
                     Target Scan
                  </CardTitle>
                  <CardDescription>
                     Enter an IP address or hostname to scan for open ports and
                     services
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <div className="flex gap-2">
                        <Input
                           placeholder="192.168.1.1 or example.com"
                           value={targetInput}
                           onChange={(e) => setTargetInput(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleScan()}
                           className="flex-1"
                        />
                        <Button
                           onClick={handleScan}
                           disabled={isScanning || !targetInput.trim()}
                           className="min-w-24">
                           {isScanning ? "Scanning..." : "Scan"}
                        </Button>
                     </div>

                     {scanError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                           <p className="text-sm text-red-700">
                              <strong>Scan Error:</strong> {scanError}
                           </p>
                        </div>
                     )}

                     {isScanning && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                           <p className="text-sm text-blue-700">
                              Running nmap scan on {targetInput}... This may
                              take a few minutes.
                           </p>
                        </div>
                     )}
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Saved Scans</CardTitle>
                  <CardDescription>
                     Each scan you run is saved here. Use Preview to see full
                     details.
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  {isLoading ? (
                     <p className="text-sm text-muted-foreground">
                        Loading scans...
                     </p>
                  ) : scans.length === 0 ? (
                     <p className="text-sm text-muted-foreground">
                        No scans yet. Run a scan to populate the table.
                     </p>
                  ) : (
                     <div className="rounded-md border">
                        <Table>
                           <TableHeader>
                              <TableRow>
                                 <TableHead className="w-[28%]">
                                    Target
                                 </TableHead>
                                 <TableHead>IP</TableHead>
                                 <TableHead>Status</TableHead>
                                 <TableHead className="text-right">
                                    Open Ports
                                 </TableHead>
                                 <TableHead>Scan Date</TableHead>
                                 <TableHead className="text-right">
                                    Actions
                                 </TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {scans.map((row) => (
                                 <TableRow key={row.id}>
                                    <TableCell className="font-mono">
                                       {row.target}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                       {row.data.host.ip}
                                    </TableCell>
                                    <TableCell>
                                       <Badge
                                          variant={
                                             row.data.host.status === "up"
                                                ? "default"
                                                : "destructive"
                                          }>
                                          {row.data.host.status}
                                       </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                       {getOpenPortsCount(row.data)}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                       {new Date(
                                          row.data.scan_date
                                       ).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                             setSelectedScan(row.data);
                                             setPreviewOpen(true);
                                          }}
                                          className="inline-flex items-center gap-2">
                                          <Eye className="h-4 w-4" />
                                          Preview
                                       </Button>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </CardContent>
            </Card>

            {/* {scanData && (
               <ScanDetails data={scanData} getStateColor={getStateColor} />
            )} */}
         </div>

         <ScrollArea>
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
               <DialogContent className="min-w-[80vw] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                     <DialogTitle>Scan Preview</DialogTitle>
                     <DialogDescription>
                        Full details for the selected scan.
                     </DialogDescription>
                  </DialogHeader>
                  {selectedScan ? (
                     <ScanDetails
                        data={selectedScan}
                        getStateColor={getStateColor}
                     />
                  ) : (
                     <p className="text-sm text-muted-foreground">
                        No scan selected.
                     </p>
                  )}
               </DialogContent>
            </Dialog>
         </ScrollArea>
      </div>
   );
}