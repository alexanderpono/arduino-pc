interface MainControllerForWs {
    onWsMesage: (msg: string) => void;
}
export class Ws {
    private wsClient;

    constructor(private ctrl: MainControllerForWs) {}

    getWsClient = () => this.wsClient;

    onConnect = (wsClient) => {
        this.wsClient = wsClient;
        console.log('Ws: Новый пользователь');
        this.wsClient.send(JSON.stringify({ fromServer: 'Привет' }));
        this.wsClient.on('message', this.onMessage);

        this.wsClient.on('close', function () {
            console.log('Ws: Пользователь отключился');
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
