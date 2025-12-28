import React from 'react';
import { Camera, Wifi, WifiOff, HardDrive, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DeviceCapabilityStatus } from '@/services/deviceCapabilitiesService';

interface DeviceStatusIndicatorProps {
    status: DeviceCapabilityStatus;
    compact?: boolean;
}

export const DeviceStatusIndicator: React.FC<DeviceStatusIndicatorProps> = ({
    status,
    compact = false,
}) => {
    const getStatusIcon = (state: string) => {
        switch (state) {
            case 'available':
            case 'online':
                return <CheckCircle2 className="h-4 w-4 text-green-600" />;
            case 'denied':
            case 'unavailable':
            case 'offline':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'checking':
                return <AlertCircle className="h-4 w-4 text-yellow-600 animate-pulse" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'available':
            case 'online':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'denied':
            case 'unavailable':
            case 'offline':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'checking':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (state: string) => {
        switch (state) {
            case 'available':
                return 'Available';
            case 'denied':
                return 'Denied';
            case 'unavailable':
                return 'Unavailable';
            case 'online':
                return 'Online';
            case 'offline':
                return 'Offline';
            case 'checking':
                return 'Checking...';
            default:
                return 'Unknown';
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getStatusColor(status.network)}>
                    {status.network === 'online' ? (
                        <Wifi className="h-3 w-3 mr-1" />
                    ) : (
                        <WifiOff className="h-3 w-3 mr-1" />
                    )}
                    {getStatusText(status.network)}
                </Badge>
                <Badge variant="outline" className={getStatusColor(status.camera)}>
                    <Camera className="h-3 w-3 mr-1" />
                    Camera
                </Badge>
                <Badge variant="outline" className={getStatusColor(status.localStorage)}>
                    <HardDrive className="h-3 w-3 mr-1" />
                    Storage
                </Badge>
            </div>
        );
    }

    return (
        <Card className="border-2">
            <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Device Status
                </h3>
                <div className="space-y-2">
                    {/* Network Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {status.network === 'online' ? (
                                <Wifi className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <WifiOff className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm">Network</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status.network)}
                            <span className="text-xs font-medium">
                                {getStatusText(status.network)}
                            </span>
                        </div>
                    </div>

                    {/* Camera Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Camera</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status.camera)}
                            <span className="text-xs font-medium">
                                {getStatusText(status.camera)}
                            </span>
                        </div>
                    </div>

                    {/* Local Storage Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Local Storage</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status.localStorage)}
                            <span className="text-xs font-medium">
                                {getStatusText(status.localStorage)}
                            </span>
                        </div>
                    </div>

                    {/* IndexedDB Status */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">IndexedDB</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status.indexedDB)}
                            <span className="text-xs font-medium">
                                {getStatusText(status.indexedDB)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
