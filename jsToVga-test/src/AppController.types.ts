export interface AppControllerForUI {
    onAppMount: () => void;
    wsSendToVGA: (msg: string) => void;
    wsClearScreen: () => void;
    onTimer: (timer: number) => void;
}
