import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';
import { JsonMessageFromUI, MainControllerForWs } from './ServerController.types';
import { createWsDeviceFound } from './ports/Ws.types';
import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';

enum MyState {
    CREATED = 'CREATED',
    PORT_IS_OPENED = 'PORT_IS_OPENED',
    WAITING_FOR_DEVICE_TYPE = 'WAITING_FOR_DEVICE_TYPE',
    WAITING_FOR_DEVICE_ID = 'WAITING_FOR_DEVICE_ID',
    WAITING_FOR_DEVICE_VER = 'WAITING_FOR_DEVICE_VER',
    WAITING_FOR_DEVICE_CAPS = 'WAITING_FOR_DEVICE_CAPS',
    WORKING = 'WORKING'
}
enum SerialCommand {
    GET_DEVICE_TYPE = '\\dt',
    GET_DEVICE_ID = '\\di',
    GET_DEVICE_CAPS = '\\dc'
}
interface SerialDeviceStatus {
    state: MyState;
    path: string;
    portHandler: SerialPort;
    messageBuffer: string;
    usbDeviceType: string;
    usbDeviceID: string;
    usbDeviceCaps: string;
    isUsbDeviceReady: boolean;
}

export class ServerController implements MainControllerForWs {
    private serial: Serial;
    private rest: RestServer;
    private ws: Ws;
    private wsServer;
    private state: MyState;
    private isWsConnected: boolean;
    private devices: SerialDeviceStatus[];

    constructor(private restPort: number) {
        this.devices = [];
        this.serial = new Serial();
        this.ws = new Ws(this);
        this.rest = new RestServer(this.restPort);

        const port = 3000;
        console.log(`ServerController: listening WS ${port}, REST ${restPort}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
        this.rest.run();
        this.state = MyState.CREATED;
        this.isWsConnected = false;
        this.findDevices();
    }

    listenersToSetRGB = [];
    listenersToGetRGB = [];
    onMessageFromSerial = (path: string, text: string) => {
        console.log(`onMessageFromSerial ${path}:`, text.trim());

        const portData = this.devices.find((device) => device.path === path);
        if (typeof portData === 'undefined') {
            return;
        }

        if (portData.state === MyState.WAITING_FOR_DEVICE_TYPE) {
            portData.usbDeviceType = text.trim();
            this.messageToSerial(path, SerialCommand.GET_DEVICE_ID);
            portData.state = MyState.WAITING_FOR_DEVICE_ID;
            return;
        }

        if (portData.state === MyState.WAITING_FOR_DEVICE_ID) {
            portData.usbDeviceID = text.trim();
            this.messageToSerial(path, SerialCommand.GET_DEVICE_CAPS);
            portData.state = MyState.WAITING_FOR_DEVICE_CAPS;
            return;
        }

        if (portData.state === MyState.WAITING_FOR_DEVICE_CAPS) {
            portData.usbDeviceCaps = text.trim();
            portData.state = MyState.WORKING;
            portData.isUsbDeviceReady = true;

            if (this.isWsConnected) {
                this.sendWsDeviceFound(path);
            }

            return;
        }

        if (this.state === MyState.WORKING) {
            this.ws.send(text);
        }
    };

    sendWsDeviceFound = (path: string) => {
        const portData = this.devices.find((device) => device.path === path);
        if (typeof portData === 'undefined') {
            return;
        }

        this.ws.send(
            JSON.stringify(
                createWsDeviceFound(
                    portData.usbDeviceID,
                    portData.usbDeviceType,
                    portData.usbDeviceID,
                    portData.usbDeviceCaps
                )
            )
        );
    };
    onWsConnect = () => {
        this.isWsConnected = true;
        this.devices.forEach((portData) => {
            if (portData.isUsbDeviceReady) {
                this.sendWsDeviceFound(portData.path);
            }
        });
    };

    onWsMesage = (message: string) => {
        console.log('on(message) message=', message);
        try {
            const jsonMessage: JsonMessageFromUI = JSON.parse(message);
            console.log('on(message) jsonMessage=', jsonMessage);
            switch (jsonMessage.action) {
                case 'TO_SERIAL':
                    console.log('jsonMessage=', jsonMessage);
                    const portData = this.devices.find(
                        (device) => '' + device.usbDeviceID === '' + jsonMessage.deviceId
                    );
                    if (typeof portData === 'undefined') {
                        return;
                    }
                    this.messageToSerial(portData.path, jsonMessage.data);
                    break;
                default:
                    console.log('Ws: Unknown command');
                    break;
            }
        } catch (error) {
            console.log('Ws: error', error);
        }
    };

    messageToSerial = (path: string, msg: string) => {
        console.log(`messageToSerial ${path} msg=`, msg);
        const portData = this.devices.find((device) => device.path === path);
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
        const portData = this.devices.find((device) => device.path === path);
        if (typeof portData !== 'undefined') {
            portData.state = MyState.PORT_IS_OPENED;

            setTimeout(() => {
                portData.state = MyState.WAITING_FOR_DEVICE_TYPE;
                this.messageToSerial(path, SerialCommand.GET_DEVICE_TYPE);
            }, 2000);
        }
    };

    findDevices = async () => {
        const availableSerialPorts = await this.serial.getAvailablePorts();
        console.log('findDevices() availableSerialPorts=', availableSerialPorts);

        this.devices = availableSerialPorts.map((portInfo: PortInfo): SerialDeviceStatus => {
            const path = portInfo.path;
            const deviceInfo: SerialDeviceStatus = {
                state: MyState.CREATED,
                path: path,
                portHandler: new SerialPort({
                    path: path,
                    baudRate: 9600
                }),
                messageBuffer: ``,
                usbDeviceType: ``,
                usbDeviceID: ``,
                usbDeviceCaps: ``,
                isUsbDeviceReady: false
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
