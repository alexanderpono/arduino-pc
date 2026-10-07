import { MainControllerForWs } from '@src/ServerController.types';

export class Ws {
    private wsClient;

    constructor(private ctrl: MainControllerForWs) {}

    getWsClient = () => this.wsClient;

    onConnect = (wsClient) => {
        this.wsClient = wsClient;
        console.log('Ws: A new user');
        this.wsClient.send(JSON.stringify({ message: 'Hello' }));
        this.wsClient.on('message', this.onMessage);
        this.ctrl.onWsConnect();

        this.wsClient.on('close', function () {
            console.log('Ws: User disconnected');
        });
    };

    onMessage = (messageB: Buffer) => {
        const message = messageB.toString('utf-8');
        this.ctrl.onWsMesage(message);
    };

    send = (s: string) => {
        this.wsClient.send(s);
    };
}
