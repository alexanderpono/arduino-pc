import { ServerController } from './ServerController';

let server: ServerController;
class Program {
    async main() {
        const restPort = 3100;
        server = new ServerController(restPort);
    }

    static create(): Program {
        return new Program();
    }
}

Program.create().main();
