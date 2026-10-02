export interface MainControllerForWs {
    onWsMesage: (msg: string) => void;
    onWsConnect: () => void;
}

export interface JsonMessageFromUI {
    action: string;
    data: string;
    deviceId: string;
}
