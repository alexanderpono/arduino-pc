export interface AppControllerForUI {
    onAppMount: () => void;
    wsSend: (msg: string) => void;
    wsClearScreen: () => void;
    onTimer: (timer: number) => void;
}
