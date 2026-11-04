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

const MAX_GR_X = 119;
const MAX_GR_Y = 39;
export class AppController implements AppControllerForUI {
    private myWs: IWebSocket = defaultWS;
    private appSTM: AppStateManager;
    private vgaDeviceId: string;
    private kbDeviceId: string;
    private mouseDeviceId: string;
    private isMouseReady: boolean;
    private mouseX: number;
    private mouseY: number;

    constructor() {
        this.appSTM = AppStateManager.create();
        this.vgaDeviceId = '';
        this.kbDeviceId = '';
        this.mouseDeviceId = '';
        this.isMouseReady = false;
        this.mouseX = 0;
        this.mouseY = 0;
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
        if (newDevice.type === 'KB') {
            this.appSTM.isKbReady(true);
            this.kbDeviceId = newDevice.id;
            this.onKBReady();
        }
        if (newDevice.type === 'MOUSE') {
            this.isMouseReady = true;
            this.mouseDeviceId = newDevice.id;
            this.onMouseReady();
        }
    };

    onVGAReady = () => {
        console.log('onVGAReady()');
        const appState = this.appSTM.getApp();
        if (appState.isKbReady && appState.isVgaReady && this.isMouseReady) {
            this.onDevicesReady();
        }
    };

    onKBReady = () => {
        console.log('onKBReady()');
        const appState = this.appSTM.getApp();
        if (appState.isKbReady && appState.isVgaReady && this.isMouseReady) {
            this.onDevicesReady();
        }
    };

    onMouseReady = () => {
        console.log('onMouseReady()');
        const appState = this.appSTM.getApp();
        if (appState.isKbReady && appState.isVgaReady && this.isMouseReady) {
            this.onDevicesReady();
        }
    };

    moveGrCursorTo = (x: number, y: number) => {
        this.wsSendToVGA(`\\gcp${x},${y};`);
    };

    onDevicesReady = () => {
        console.log('onDevicesReady()');
        this.mouseX = 60;
        this.mouseY = 20;
        this.moveGrCursorTo(this.mouseX, this.mouseY);
        this.wsSendToVGA(`\\gco0`);
        this.wsSendToVGA(`\\tco0`);
        this.wsSendToVGA(`\\cl`);
        this.wsSendToVGA(`\\wp1,1;`);
        this.wsSendToVGA(`\\gb0,9,10,10,1,2;`);
        this.wsSendToVGA(`\\gb10,9,10,10,1,2;`);
        this.wsSendToVGA(`\\gb20,9,10,10,1,2;`);
        this.wsSendToVGA(`\\gb30,9,10,10,1,2;`);
        this.wsSendToVGA(`\\gb0,19,10,10,1,2;`);
        this.wsSendToVGA(`\\gb10,19,10,10,1,2;`);
        this.wsSendToVGA(`\\gb20,19,10,10,1,2;`);
        this.wsSendToVGA(`\\gb30,19,10,10,1,2;`);
        this.wsSendToVGA(`\\gb0,29,10,10,3,2;`);
        this.wsSendToVGA(`\\gb10,29,10,10,3,2;`);
        this.wsSendToVGA(`\\gb20,29,10,10,3,2;`);
        this.wsSendToVGA(`\\gb30,29,10,10,3,2;`);
        setTimeout(() => {
            this.wsSendToVGA(`\\gco1`);
            this.wsSendToVGA(`\\tco1`);
            this.wsSendToVGA(`10 PRINT A`);
        }, 1000);
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
        const colonPos = msgData.indexOf(':');
        if (colonPos < 0) {
            console.error('Divider ":" is not found');
            return;
        }
        const prefix = msgData.substring(0, colonPos);
        if (prefix === this.vgaDeviceId) {
            const messages = this.appSTM.getApp().vgaAnswers;
            this.appSTM.vgaAnswers(messages + msgData.substring(colonPos + 1));
        }
        if (prefix === this.kbDeviceId) {
            const keyboardInput = msgData.substring(colonPos + 1).trim();
            switch (keyboardInput) {
                case '[ESC]':
                case '[PAGEUP]':
                case '[PAGEDOWN]':
                case '[UPARROW]':
                case '[LEFTARROW]':
                case '[DOWNARROW]':
                case '[RIGHTARROW]':
                    break;

                case '[ENTER]':
                    this.wsSendToVGA('\\n');
                    break;

                case '[BACKSPACE]':
                    this.wsSendToVGA('\\bs');
                    break;

                case '[TAB]':
                    this.wsSendToVGA('   ');
                    break;

                case '[SPACE]':
                    this.wsSendToVGA(' ');
                    break;

                case '\\':
                    this.wsSendToVGA('\\\\');
                    break;

                default:
                    this.wsSendToVGA(keyboardInput);
            }
        }

        if (prefix === this.mouseDeviceId) {
            const mouseInput = msgData
                .substring(colonPos + 1)
                .trim()
                .split(';')
                .join('')
                .split(',');
            if (mouseInput[0] === 'MOVE') {
                const dx = parseInt(mouseInput[1]);
                const dy = parseInt(mouseInput[2]);
                if (isNaN(dx) || isNaN(dy)) {
                    return;
                }
                this.mouseX += dx;
                this.mouseY -= dy;
                if (this.mouseX < 0) {
                    this.mouseX = 0;
                }
                if (this.mouseY < 0) {
                    this.mouseY = 0;
                }
                if (this.mouseX > MAX_GR_X) {
                    this.mouseX = MAX_GR_X;
                }
                if (this.mouseY > MAX_GR_Y) {
                    this.mouseY = MAX_GR_Y;
                }
                this.moveGrCursorTo(this.mouseX, this.mouseY);
            }
        }
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
