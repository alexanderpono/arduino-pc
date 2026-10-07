import { autoDetect, PortInfo } from '@serialport/bindings-cpp';

export class Serial {
    async getAvailablePorts(): Promise<PortInfo[]> {
        const ports = await autoDetect().list();
        const availablePorts = ports.filter((port) => {
            if (!port.pnpId) {
                return false;
            }
            return /USB/i.test(port.pnpId);
        });
        if (availablePorts.length < 1) {
            return Promise.reject(false);
        }
        return availablePorts;
    }
}
