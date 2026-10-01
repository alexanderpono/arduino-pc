import { autoDetect } from '@serialport/bindings-cpp';
import { MainControllerForSerial } from '@src/ServerController.types';
import { SerialPort } from 'serialport';

export class Serial {
    private port: SerialPort | null = null;

    private messageBuffer = '';

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

        this.port.on('open', () => {
            this.ctrl.onPortOpened();
        });

        this.port.on('readable', () => {
            let data: Buffer | string | null;
            while ((data = (this.port as SerialPort).read()) !== null) {
                this.messageBuffer += data.toString('utf8');

                let newlineIndex: number;
                while ((newlineIndex = this.messageBuffer.indexOf('\n')) !== -1) {
                    const text = this.messageBuffer.substring(0, newlineIndex).trim();
                    this.messageBuffer = this.messageBuffer.substring(newlineIndex + 1);
                    if (text.length > 0) {
                        this.ctrl.onMessageFromSerial(text + '\n');
                    }
                }
            }
        });
    }
    async getPort(): Promise<string> {
        const ports = await autoDetect().list();
        console.log('getPort() ports=', ports);
        const availablePorts = ports.filter((port) => {
            if (!port.pnpId) {
                return false;
            }
            return /USB/i.test(port.pnpId);
        });
        console.log('getPort() availablePorts=', availablePorts);
        if (availablePorts.length < 1) {
            return Promise.reject(false);
        }
        console.log('getPort() port=', availablePorts[0]);
        return availablePorts[0].path;
    }

    send = (msg: string) => {
        (this.port as SerialPort).write(msg, function (err) {
            if (err) {
                return console.log('Serial: Error on write: ', err.message);
            }
        });
    };
}
