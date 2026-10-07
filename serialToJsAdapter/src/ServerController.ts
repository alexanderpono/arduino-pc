import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';
import {
    PortState,
    JsonMessageFromUI,
    MainControllerForWs,
    SerialCommand,
    SerialPortInfo,
    DeviceInfo,
    defaultDeviceInfo
} from './ServerController.types';
import { createWsDeviceFound } from './ports/Ws.types';
import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';

export class ServerController implements MainControllerForWs {
    private serial: Serial;
    private rest: RestServer;
    private ws: Ws;
    private wsServer;
    private isWsConnected: boolean;
    private ports: SerialPortInfo[];
    private devices: DeviceInfo[];

    constructor(private restPort: number) {
        this.ports = [];
        this.devices = [];
        this.serial = new Serial();
        this.ws = new Ws(this);
        this.rest = new RestServer(this.restPort);

        const port = 3000;
        console.log(`ServerController: listening WS ${port}, REST ${restPort}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
        this.rest.run();
        this.isWsConnected = false;
        this.findDevices();
    }

    getIndexAtDevices = (portData: SerialPortInfo) => {
        return this.devices
            .map((device, index) => {
                if (device.port === portData.path) {
                    return index;
                }
                return -1;
            })
            .filter((index) => index >= 0);
    };

    onMessageFromSerial = (path: string, text: string) => {
        console.log(`onMessageFromSerial ${path}:`, text.trim());

        const portData = this.ports.find((device) => device.path === path);
        if (typeof portData === 'undefined') {
            console.log(`portData (${path}) is not found`);
            console.log('this.ports=', this.ports);
            return;
        }

        const COMPOSITE = 'COMPOSITE:';
        if (portData.state === PortState.WAITING_FOR_DEVICE_TYPE) {
            const gotDeviceType = text.trim();
            if (gotDeviceType.startsWith(COMPOSITE)) {
                const newDevices = gotDeviceType
                    .substring(COMPOSITE.length)
                    .split(',')
                    .map((deviceType) => {
                        const newDevice: DeviceInfo = {
                            ...defaultDeviceInfo,
                            port: portData.path,
                            type: deviceType,
                            isComposite: true
                        };
                        return newDevice;
                    });
                this.devices = [...this.devices, ...newDevices];
            } else {
                const newDevice: DeviceInfo = {
                    ...defaultDeviceInfo,
                    port: portData.path,
                    type: gotDeviceType
                };
                this.devices.push(newDevice);
            }
            this.messageToSerial(path, SerialCommand.GET_DEVICE_ID);
            portData.state = PortState.WAITING_FOR_DEVICE_ID;
            return;
        }

        if (portData.state === PortState.WAITING_FOR_DEVICE_ID) {
            const gotDeviceId = text.trim();

            if (gotDeviceId.startsWith(COMPOSITE)) {
                const deviceIds = gotDeviceId.substring(COMPOSITE.length).split(',');
                const indexAtDevices = this.getIndexAtDevices(portData);
                if (indexAtDevices.length !== deviceIds.length) {
                    console.error('Devices is not found for port=', portData.path);
                    return;
                }
                indexAtDevices.forEach((indexAtDevices, idx) => {
                    this.devices[indexAtDevices].id = deviceIds[idx];
                });
            } else {
                const deviceIndex = this.devices.findIndex(
                    (device) => device.port === portData.path
                );
                if (deviceIndex < 0) {
                    console.error('Device is not found for port=', portData.path);
                    return;
                }
                this.devices[deviceIndex].id = gotDeviceId;
            }

            this.messageToSerial(path, SerialCommand.GET_DEVICE_CAPS);
            portData.state = PortState.WAITING_FOR_DEVICE_CAPS;
            return;
        }

        if (portData.state === PortState.WAITING_FOR_DEVICE_CAPS) {
            const gotDeviceCaps = text.trim();

            if (gotDeviceCaps.startsWith(COMPOSITE)) {
                const deviceCapses = gotDeviceCaps.substring(COMPOSITE.length).split(',');
                const indexAtDevices = this.getIndexAtDevices(portData);
                if (indexAtDevices.length !== deviceCapses.length) {
                    console.error('Devices is not found for port=', portData.path);
                    return;
                }
                indexAtDevices.forEach((indexAtDevices, idx) => {
                    this.devices[indexAtDevices].caps = deviceCapses[idx];
                    this.devices[indexAtDevices].isReady = true;

                    if (this.isWsConnected) {
                        this.sendWsDeviceFound(this.devices[indexAtDevices]);
                    }
                });
            } else {
                const deviceIndex = this.devices.findIndex(
                    (device) => device.port === portData.path
                );
                if (deviceIndex < 0) {
                    console.error('Device is not found for port=', portData.path);
                    return;
                }
                this.devices[deviceIndex].caps = gotDeviceCaps;
                this.devices[deviceIndex].isReady = true;

                if (this.isWsConnected) {
                    this.sendWsDeviceFound(this.devices[deviceIndex]);
                }
            }
            console.log('this.devices=', this.devices);

            portData.state = PortState.WORKING;

            return;
        }

        if (portData.state === PortState.WORKING) {
            const devicesForThisPort = this.devices.filter(
                (device) => device.port === portData.path
            );
            if (devicesForThisPort.length === 1) {
                this.ws.send(devicesForThisPort[0].id + ':' + text);
            }
            if (devicesForThisPort.length > 1) {
                const colonPos = text.indexOf(':');
                const index = parseInt(text.substring(0, colonPos));
                const textTail = text.substring(colonPos + 1);
                const ERROR_MESSAGE = 'cannot find device for message:';
                if (!isNaN(index)) {
                    const deviceInfo = devicesForThisPort[index];
                    if (typeof deviceInfo != undefined) {
                        this.ws.send(deviceInfo.id + ':' + textTail);
                    } else {
                        console.error(ERROR_MESSAGE, text);
                    }
                } else {
                    console.error(ERROR_MESSAGE, text);
                }
            }
        }
    };

    sendWsDeviceFound = (deviceData: DeviceInfo) => {
        this.ws.send(
            JSON.stringify(
                createWsDeviceFound(deviceData.id, deviceData.type, deviceData.id, deviceData.caps)
            )
        );
    };
    onWsConnect = () => {
        this.isWsConnected = true;
        this.devices.forEach((deviceData) => {
            if (deviceData.isReady) {
                this.sendWsDeviceFound(deviceData);
            }
        });
    };

    onWsMesage = (message: string) => {
        try {
            const jsonMessage: JsonMessageFromUI = JSON.parse(message);
            console.log('on(message) jsonMessage=', jsonMessage);
            switch (jsonMessage.action) {
                case 'TO_SERIAL':
                    const deviceData = this.devices.find(
                        (device) => device.id === jsonMessage.deviceId
                    );
                    if (typeof deviceData === 'undefined') {
                        console.log(
                            'onWsMesage() deviceData is not found for message',
                            jsonMessage
                        );
                        console.log('this.devices=', this.devices);
                        return;
                    }
                    this.messageToSerial(deviceData.port, jsonMessage.data);
                    break;
                default:
                    console.log('Ws: Unknown command');
                    break;
            }
        } catch (error) {
            console.log('Ws: error', error, 'for message', message);
        }
    };

    messageToSerial = (path: string, msg: string) => {
        console.log(`messageToSerial ${path} msg=`, msg);
        const portData = this.ports.find((device) => device.path === path);
        if (typeof portData !== 'undefined') {
            portData.portHandler.write(msg, function (err) {
                if (err) {
                    return console.log(`Serial: ${path} Error on write: `, err.message);
                }
            });
        }
    };

    onSerialPortOpened = (path: string) => {
        console.log(`Port ${path} is opened`);
        const portData = this.ports.find((device) => device.path === path);
        if (typeof portData !== 'undefined') {
            portData.state = PortState.PORT_IS_OPENED;

            setTimeout(() => {
                portData.state = PortState.WAITING_FOR_DEVICE_TYPE;
                this.messageToSerial(path, SerialCommand.GET_DEVICE_TYPE);
            }, 2000);
        }
    };

    findDevices = async () => {
        const availableSerialPorts = await this.serial.getAvailablePorts();
        console.log('findDevices() availableSerialPorts=', availableSerialPorts);

        this.ports = availableSerialPorts.map((portInfo: PortInfo): SerialPortInfo => {
            const path = portInfo.path;
            const deviceInfo: SerialPortInfo = {
                state: PortState.CREATED,
                path: path,
                portHandler: new SerialPort({
                    path: path,
                    baudRate: 9600
                }),
                messageBuffer: ``,
                isComposite: false
            };

            deviceInfo.portHandler.on('error', function (err) {
                console.log(`Serial ${path}: Error: `, err.message);
            });

            deviceInfo.portHandler.on('open', () => {
                this.onSerialPortOpened(path);
            });

            deviceInfo.portHandler.on('readable', () => {
                let data: Buffer | string | null;
                while ((data = deviceInfo.portHandler.read()) !== null) {
                    deviceInfo.messageBuffer += data.toString('utf8');

                    let newlineIndex: number;
                    while ((newlineIndex = deviceInfo.messageBuffer.indexOf('\n')) !== -1) {
                        const text = deviceInfo.messageBuffer.substring(0, newlineIndex).trim();
                        deviceInfo.messageBuffer = deviceInfo.messageBuffer.substring(
                            newlineIndex + 1
                        );
                        if (text.length > 0) {
                            this.onMessageFromSerial(path, text + '\n');
                        }
                    }
                }
            });

            return deviceInfo;
        });
    };
}
