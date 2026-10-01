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
