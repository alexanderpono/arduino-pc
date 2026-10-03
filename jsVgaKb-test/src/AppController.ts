import { createWsMessage, Device, WsMessage, WsMsgDeviceFound } from './app.types';
import { AppControllerForUI } from './AppController.types';
import { AppStateManager } from './AppStateManager';
import { toMMSS } from './util';

interface IWebSocket {
    onopen: null | ((p) => void);
    onmessage: null | ((p) => void);
    onclose: null | ((p) => void);
    readyState: number;
    send: (p) => void;
}
const defaultWS: IWebSocket = {
    onopen: () => {
        return null;
    },
    onmessage: () => {
        return null;
    },
    onclose: () => {
        return null;
    },
    readyState: 0,
    send: () => {
        return null;
    }
};

export class AppController implements AppControllerForUI {
    private myWs: IWebSocket = defaultWS;
    private appSTM: AppStateManager;
    private vgaDeviceId: string;

    constructor() {
        this.appSTM = AppStateManager.create();
        this.vgaDeviceId = '';
    }

    onAppMount = () => {
        console.log('onAppMount()');

        this.createWs();
    };

    onDeviceFound = (msgDeviceFound: WsMsgDeviceFound) => {
        const devices = this.appSTM.getApp().devices;
        const newDevice: Device = {
            type: msgDeviceFound.type,
            id: msgDeviceFound.id,
            caps: msgDeviceFound.caps
        };
        if (devices.findIndex((d) => d.id === newDevice?.id) >= 0) {
        } else {
            this.appSTM.devices([...devices, newDevice]);
        }
        if (newDevice.type === 'VGA') {
            this.appSTM.isVgaReady(true);
            this.vgaDeviceId = newDevice.id;
            this.onVGAReady();
        }
    };

    onVGAReady = () => {
        console.log('onVGAReady()');
        this.wsSendToVGA('Message to VGA');
    };

    onWsMessage = (message: WsMessage) => {
        const msgData = message.data;
        console.log('%s', msgData);
        try {
            const json = JSON.parse(msgData);
            if (json.message === 'DEVICE_FOUND') {
                const msgDeviceFound = json as WsMsgDeviceFound;
                this.onDeviceFound(msgDeviceFound);
                return;
            }
            if (json.message === 'Hello') {
                return;
            }
        } catch (e) {}
        const messages = this.appSTM.getApp().vgaAnswers;
        this.appSTM.vgaAnswers(messages + msgData);
    };

    createWs() {
        this.myWs = new WebSocket('ws://localhost:3000');
        this.myWs.onopen = function () {
            console.log('connected');
        };
        this.myWs.onmessage = this.onWsMessage;

        this.myWs.onclose = () => {
            console.log('disconnected. Autoconnect in 5 s...');
            setTimeout(() => {
                console.log('Trying to connect to WS');
                this.createWs();
            }, 5000);
        };
    }

    wsSendToVGA(text: string) {
        if (this.myWs.readyState === WebSocket.OPEN) {
            const message = JSON.stringify(createWsMessage(this.vgaDeviceId, text));
            console.log('OUT: ', message);
            this.myWs.send(message);
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    wsSend(text: string) {
        if (this.myWs.readyState === WebSocket.OPEN) {
            this.myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: text }));
        } else {
            console.warn('WebSocket is not connected');
        }
    }

    wsClearScreen() {
        this.myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '\\cl' }));
    }

    onTimer = (timer: number) => {
        // this.wsSend('\\cl' + toMMSS(timer));
        // const color = (timer % 3) + 1;
        // wsSend('\\c' + color + toMMSS(timer) + '\\n');
        // this.wsSend(toMMSS(timer) + '\\n');
        // this.wsSend('\\r' + toMMSS(timer));
    };
}
