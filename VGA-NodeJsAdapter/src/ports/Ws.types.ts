export interface WsDeviceFound {
    message: 'DEVICE_FOUND';
    deviceId: string;
    type: string;
    id: string;
    caps: string;
}

export const createWsDeviceFound = (
    deviceId: string,
    type: string,
    id: string,
    caps: string
): WsDeviceFound => ({
    message: 'DEVICE_FOUND',
    deviceId,
    type,
    id,
    caps
});
