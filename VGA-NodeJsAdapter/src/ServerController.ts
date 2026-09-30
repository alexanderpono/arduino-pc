import { RestServer } from './ports/RestServer';
import { Serial } from './ports/Serial';
import { Ws } from './ports/Ws';
import { WebSocket } from 'ws';

interface JsonMessageFromUI {
    action: string;
    data: string;
}
export class ServerController {
    private serial: Serial;
    private rest: RestServer;

    private ws: Ws;
    private wsServer;
    constructor(private restPort: number) {
        this.serial = new Serial(this);
        this.ws = new Ws(this);
        this.rest = new RestServer(this.restPort);

        const port = 3000;
        console.log(`ServerController: listening WS ${port}, REST ${restPort}`);

        this.wsServer = new WebSocket.Server({ port });
        this.wsServer.on('connection', this.ws.onConnect);
        this.rest.run();
    }

    listenersToSetRGB = [];
    listenersToGetRGB = [];
    onMessageFromSerial = (text: string) => {
        console.log('onMessageFromSerial:', text.trim());
        this.ws.send(text);
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
}
