import { autoDetect } from '@serialport/bindings-cpp';
import { SerialPort } from 'serialport';

interface MainControllerForSerial {
    onMessageFromSerial: (msg: string) => void;
}
export class Serial {
    private port: SerialPort | null = null;

    constructor(private ctrl: MainControllerForSerial) {
        this.main();
    }

    async main() {
        let portS = '';
        try {
            portS = await this.getPort();
        } catch (e) {
            console.error('Serial: Arduino Not found');
            return;
        }
        console.log('Serial: Arduino found at:', portS);

        this.port = new SerialPort({
            path: portS,
            baudRate: 9600
        });

        this.port.on('error', function (err) {
            console.log('Serial: Error: ', err.message);
        });

        this.port.on('readable', () => {
            const dataBuffer = (this.port as SerialPort).read();
            const text = dataBuffer.toString('utf8').trim();
            this.ctrl.onMessageFromSerial(text);
        });
    }
    async getPort(): Promise<string> {
        const ports = await autoDetect().list();
        const port = ports.find((port) => {
            return /USB/i.test(port.pnpId as string)
        });
        if (!port) {
            return Promise.reject(false);
        }
        return port.path;
    }

    send = (msg: string) => {
        (this.port as SerialPort).write(msg, function (err) {
            if (err) {
                return console.log('Serial: Error on write: ', err.message);
            }
        });
    };
}
