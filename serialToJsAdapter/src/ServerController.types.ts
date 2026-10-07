import { SerialPort } from 'serialport';

export interface MainControllerForWs {
    onWsMesage: (msg: string) => void;
    onWsConnect: () => void;
}

export interface JsonMessageFromUI {
    action: string;
    data: string;
    deviceId: string;
}

export enum PortState {
    CREATED = 'CREATED',
    PORT_IS_OPENED = 'PORT_IS_OPENED',
    WAITING_FOR_DEVICE_TYPE = 'WAITING_FOR_DEVICE_TYPE',
    WAITING_FOR_DEVICE_ID = 'WAITING_FOR_DEVICE_ID',
    WAITING_FOR_DEVICE_VER = 'WAITING_FOR_DEVICE_VER',
    WAITING_FOR_DEVICE_CAPS = 'WAITING_FOR_DEVICE_CAPS',
    WORKING = 'WORKING'
}

export interface SerialPortInfo {
    state: PortState;
    path: string;
    portHandler: SerialPort;
    messageBuffer: string;
    isComposite: boolean;
}

export interface DeviceInfo {
    port: string;
    type: string;
    id: string;
    caps: string;
    isComposite: boolean;
    isReady: boolean;
}

export const defaultDeviceInfo: DeviceInfo = {
    port: '',
    type: '',
    id: '',
    caps: '',
    isComposite: false,
    isReady: false
};

export enum SerialCommand {
    GET_DEVICE_TYPE = '\\dt',
    GET_DEVICE_ID = '\\di',
    GET_DEVICE_CAPS = '\\dc'
}
