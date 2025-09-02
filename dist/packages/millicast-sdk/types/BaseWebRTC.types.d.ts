export type Media = 'audio' | 'video';
export type ViewServerEvent = 'active' | 'inactive' | 'updated' | 'layers' | 'vad' | 'viewercount';
export type PublishServerEvent = 'active' | 'inactive' | 'viewercount';
export type DecodedJWT = {
    [key: string]: {
        streamName: string;
        record: boolean;
    };
};
export type ReconnectData = {
    error: Error;
};
