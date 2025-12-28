import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    ChevronLeft,
    ChevronRight,
    Wifi,
    WifiOff,
    Search,
    Calendar
} from 'lucide-react';
import { qrScanTrackingService, QRScanLog } from '@/services/qrScanTrackingService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const ScanHistoryTable: React.FC = () => {
    const [scans, setScans] = useState<QRScanLog[]>([]);
    const [filteredScans, setFilteredScans] = useState<QRScanLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        loadScans();
    }, []);

    useEffect(() => {
        filterScans();
    }, [searchTerm, scans]);

    const loadScans = async () => {
        try {
            setIsLoading(true);
            const data = await qrScanTrackingService.getAllScans(500);
            setScans(data);
            setFilteredScans(data);
        } catch (error) {
            console.error('Failed to load scans:', error);
            toast.error('Failed to load scan history');
        } finally {
            setIsLoading(false);
        }
    };

    const filterScans = () => {
        if (!searchTerm) {
            setFilteredScans(scans);
            setCurrentPage(1);
            return;
        }

        const filtered = scans.filter(scan =>
            scan.qrCodeData.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scan.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            scan.userAgent.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredScans(filtered);
        setCurrentPage(1);
    };

    const paginatedScans = filteredScans.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredScans.length / itemsPerPage);

    const formatTimestamp = (timestamp: string) => {
        try {
            return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
        } catch {
            return timestamp;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                    Complete history of all QR code scans
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by product ID, QR data, or user agent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Button variant="outline" onClick={loadScans}>
                        Refresh
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Product ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>User Agent</TableHead>
                                <TableHead>Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedScans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No scans found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedScans.map((scan) => (
                                    <TableRow key={scan.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    {formatTimestamp(scan.scanTimestamp)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {scan.productId?.slice(0, 8) || 'N/A'}...
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {scan.isOnline ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    <Wifi className="h-3 w-3 mr-1" />
                                                    Online
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                                    <WifiOff className="h-3 w-3 mr-1" />
                                                    Offline
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
                                                {scan.userAgent}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {scan.metadata && Object.keys(scan.metadata).length > 0 ? (
                                                <Badge variant="secondary">
                                                    {Object.keys(scan.metadata).length} fields
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">None</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredScans.length)} of {filteredScans.length} scans
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="text-sm">
                                Page {currentPage} of {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
