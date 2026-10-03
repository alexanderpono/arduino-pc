import { store } from './store';
import { app, AppState } from './appReducer';
import { Device } from './app.types';

const dispatch = (action) => store.dispatch(action);

export class AppStateManager {
    getApp = (): AppState => store.getState().app;
    devices = (devices: Device[]) => dispatch(app.devices(devices));
    vgaAnswers = (vgaAnswers: string) => dispatch(app.vgaAnswers(vgaAnswers));
    isVgaReady = (isVgaReady: boolean) => dispatch(app.isVgaReady(isVgaReady));
    isKbReady = (isKbReady: boolean) => dispatch(app.isKbReady(isKbReady));

    static create(): AppStateManager {
        return new AppStateManager();
    }
}
