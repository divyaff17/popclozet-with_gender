import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    BarChart3,
    Download,
    TrendingUp,
    Wifi,
    WifiOff,
    Calendar,
    Package
} from 'lucide-react';
import { qrScanTrackingService } from '@/services/qrScanTrackingService';
import { toast } from 'sonner';

interface ScanStats {
    totalScans: number;
    onlineScans: number;
    offlineScans: number;
    uniqueProducts: number;
    todayScans: number;
    weekScans: number;
}

export const ScanAnalytics: React.FC = () => {
    const [stats, setStats] = useState<ScanStats>({
        totalScans: 0,
        onlineScans: 0,
        offlineScans: 0,
        uniqueProducts: 0,
        todayScans: 0,
        weekScans: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            const baseStats = await qrScanTrackingService.getScanStats();

            // Get all scans for time-based filtering
            const allScans = await qrScanTrackingService.getAllScans(1000);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            const todayScans = allScans.filter(scan =>
                new Date(scan.scanTimestamp) >= today
            ).length;

            const weekScans = allScans.filter(scan =>
                new Date(scan.scanTimestamp) >= weekAgo
            ).length;

            setStats({
                ...baseStats,
                todayScans,
                weekScans,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
            toast.error('Failed to load analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const exportToCSV = async () => {
        try {
            const scans = await qrScanTrackingService.getAllScans(10000);

            const csvHeader = 'Timestamp,Product ID,QR Code Data,Online,User Agent,Metadata\n';
            const csvRows = scans.map(scan => {
                const metadata = JSON.stringify(scan.metadata || {}).replace(/"/g, '""');
                return `"${scan.scanTimestamp}","${scan.productId || ''}","${scan.qrCodeData}","${scan.isOnline}","${scan.userAgent}","${metadata}"`;
            }).join('\n');

            const csv = csvHeader + csvRows;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-scans-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Scan data exported successfully');
        } catch (error) {
            console.error('Failed to export:', error);
            toast.error('Failed to export data');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">QR Scan Analytics</h2>
                    <p className="text-muted-foreground">
                        Monitor and analyze QR code scanning activity
                    </p>
                </div>
                <Button onClick={exportToCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Scans */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Scans
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalScans.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            All time scan count
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Scans */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Today's Scans
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todayScans.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Scans in the last 24 hours
                        </p>
                    </CardContent>
                </Card>

                {/* Week Scans */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            This Week
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.weekScans.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Scans in the last 7 days
                        </p>
                    </CardContent>
                </Card>

                {/* Unique Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Unique Products
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.uniqueProducts.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Different products scanned
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Online vs Offline */}
            <Card>
                <CardHeader>
                    <CardTitle>Scan Mode Distribution</CardTitle>
                    <CardDescription>
                        Breakdown of online vs offline scans
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wifi className="h-5 w-5 text-green-600" />
                                <span className="font-medium">Online Scans</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {stats.onlineScans.toLocaleString()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {stats.totalScans > 0
                                        ? `${Math.round((stats.onlineScans / stats.totalScans) * 100)}%`
                                        : '0%'
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WifiOff className="h-5 w-5 text-orange-600" />
                                <span className="font-medium">Offline Scans</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                    {stats.offlineScans.toLocaleString()}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    {stats.totalScans > 0
                                        ? `${Math.round((stats.offlineScans / stats.totalScans) * 100)}%`
                                        : '0%'
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{
                                    width: stats.totalScans > 0
                                        ? `${(stats.onlineScans / stats.totalScans) * 100}%`
                                        : '0%'
                                }}
                            ></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
