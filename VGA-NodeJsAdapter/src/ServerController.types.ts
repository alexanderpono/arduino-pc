export interface MainControllerForSerial {
    onMessageFromSerial: (msg: string) => void;
    onPortOpened: () => void;
}

export interface MainControllerForWs {
    onWsMesage: (msg: string) => void;
    onWsConnect: () => void;
}
