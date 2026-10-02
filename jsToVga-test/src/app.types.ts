export interface Device {
    type: string;
    id: string;
    caps: string;
}

export const defaultDevice: Device = {
    type: '',
    id: '',
    caps: ''
};

export interface WsMessage {
    data: string;
}

export interface WsMsgDeviceFound {
    message: 'DEVICE FOUND';
    type: string;
    id: string;
    caps: string;
}

export interface WsMessageToDevice {
    action: 'TO_SERIAL';
    deviceId: string;
    data: string;
}

export const createWsMessage = (deviceId: string, data: string): WsMessageToDevice => ({
    action: 'TO_SERIAL',
    deviceId,
    data
});
