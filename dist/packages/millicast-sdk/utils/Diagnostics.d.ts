import { ConnectionStats, DiagnosticsObject, CMCDDiagnostics } from '../types/stats.types';

declare const Diagnostics: {
    initAccountId: (accountId: string) => void;
    initStreamName: (streamName: string) => void;
    initSubscriberId: (subscriberId: string) => void;
    initStreamViewId: (streamViewId: string) => void;
    initFeedId: (feedId: string) => void;
    setConnectionTime: (connectionTime: number) => void;
    setConnectionState: (connectionState: string) => void;
    setClusterId: (clusterId: string) => void;
    addStats: (stats: ConnectionStats) => void;
    get: (statsCount?: number, statsFormat?: string) => DiagnosticsObject | CMCDDiagnostics;
};
export default Diagnostics;
