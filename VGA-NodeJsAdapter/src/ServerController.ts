import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';
import { MainControllerForSerial, MainControllerForWs } from './ServerController.types';
import { createWsDeviceFound } from './ports/Ws.types';

interface JsonMessageFromUI {
    action: string;
    data: string;
}
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

export class ServerController implements MainControllerForSerial, MainControllerForWs {
    private serial: Serial;
    private rest: RestServer;
    private ws: Ws;
    private wsServer;
    private state: MyState;
    private usbDeviceType: string;
    private usbDeviceID: string;
    private usbDeviceCaps: string;
    private isUsbDeviceReady: boolean;
    private isWsConnected: boolean;

    constructor(private restPort: number) {
        this.serial = new Serial(this);
        this.ws = new Ws(this);
        this.rest = new RestServer(this.restPort);

        const port = 3000;
        console.log(`ServerController: listening WS ${port}, REST ${restPort}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
        this.rest.run();
        this.state = MyState.CREATED;
        this.usbDeviceType = '';
        this.usbDeviceID = '';
        this.usbDeviceCaps = '';
        this.isUsbDeviceReady = false;
        this.isWsConnected = false;
    }

    listenersToSetRGB = [];
    listenersToGetRGB = [];
    onMessageFromSerial = (text: string) => {
        console.log('onMessageFromSerial:', text.trim());
        if (this.state === MyState.WAITING_FOR_DEVICE_TYPE) {
            this.usbDeviceType = text.trim();
            this.messageToSerial(SerialCommand.GET_DEVICE_ID);
            this.state = MyState.WAITING_FOR_DEVICE_ID;
            return;
        }

        if (this.state === MyState.WAITING_FOR_DEVICE_ID) {
            this.usbDeviceID = text.trim();
            this.messageToSerial(SerialCommand.GET_DEVICE_CAPS);
            this.state = MyState.WAITING_FOR_DEVICE_CAPS;
            return;
        }

        if (this.state === MyState.WAITING_FOR_DEVICE_CAPS) {
            this.usbDeviceCaps = text.trim();
            this.state = MyState.WORKING;
            this.isUsbDeviceReady = true;

            if (this.isWsConnected) {
                this.sendWsDeviceFound();
            }

            return;
        }

        if (this.state === MyState.WORKING) {
            this.ws.send(text);
        }
    };

    sendWsDeviceFound = () => {
        this.ws.send(
            JSON.stringify(
                createWsDeviceFound(this.usbDeviceType, this.usbDeviceID, this.usbDeviceCaps)
            )
        );
    };
    onWsConnect = () => {
        this.isWsConnected = true;
        if (this.isUsbDeviceReady) {
            this.sendWsDeviceFound();
        }
    };

    onWsMesage = (message: string) => {
        console.log('on(message) message=', message);
        try {
            const jsonMessage: JsonMessageFromUI = JSON.parse(message);
            console.log('on(message) jsonMessage=', jsonMessage);
            switch (jsonMessage.action) {
                case 'TO_SERIAL':
                    console.log('jsonMessage=', jsonMessage);
                    this.serial.send(jsonMessage.data + '\n');
                    break;
                default:
                    console.log('Ws: Unknown command');
                    break;
            }
        } catch (error) {
            console.log('Ws: error', error);
        }
    };

    messageToSerial = (msg: string) => {
        console.log('messageToSerial() msg=', msg);
        this.serial.send(msg);
    };

    onPortOpened = () => {
        console.log('Port is opened');
        this.state = MyState.PORT_IS_OPENED;
        setTimeout(() => {
            this.state = MyState.WAITING_FOR_DEVICE_TYPE;
            this.messageToSerial(SerialCommand.GET_DEVICE_TYPE);
        }, 2000);
    };
}
