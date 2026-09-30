export interface UsbDrive {
    id: string;
    mountPath: string;
}

export const defaultUsbDrive: UsbDrive = {
    id: '',
    mountPath: ''
};

export const getUsbDriveFromOutput = (output: string, mountPathStart: string): UsbDrive => {
    if (!output.trim()) {
        return defaultUsbDrive;
    }

    const id = output.trim().split(' ').shift();
    const mountPath =
        mountPathStart + output.trim().split(mountPathStart).slice(1).join(mountPathStart);

    return {
        id,
        mountPath
    };
};
