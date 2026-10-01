export interface WsDeviceFound {
    message: 'DEVICE_FOUND';
    type: string;
    id: string;
    caps: string;
}

export const createWsDeviceFound = (type: string, id: string, caps: string): WsDeviceFound => ({
    message: 'DEVICE_FOUND',
    type,
    id,
    caps
});
