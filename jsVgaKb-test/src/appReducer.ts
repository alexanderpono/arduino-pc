import { handleActions } from 'redux-actions';
import { Device } from './app.types';

export enum AppEvent {
    DEFAULT = '',
    DEVICES = 'APP/DEVICES',
    VGA_ANSWERS = 'APP/VGA_ANSWERS',
    IS_VGA_READY = 'APP/IS_VGA_READY'
}

export interface AppState {
    event: AppEvent;
    devices: Device[];
    vgaAnswers: string;
    isVgaReady: boolean;
}

export const defaultAppState: AppState = {
    event: AppEvent.DEFAULT,
    devices: [],
    vgaAnswers: '',
    isVgaReady: false
};

export interface DevicesAction {
    type: AppEvent.DEVICES;
    payload: {
        devices: Device[];
    };
}

export interface VgaAnswersAction {
    type: AppEvent.VGA_ANSWERS;
    payload: {
        vgaAnswers: string;
    };
}

export interface IsVgaReadyAction {
    type: AppEvent.IS_VGA_READY;
    payload: {
        isVgaReady: boolean;
    };
}

export const app = {
    devices: (devices: Device[]): DevicesAction => ({
        type: AppEvent.DEVICES,
        payload: { devices }
    }),
    vgaAnswers: (vgaAnswers: string): VgaAnswersAction => ({
        type: AppEvent.VGA_ANSWERS,
        payload: { vgaAnswers }
    }),
    isVgaReady: (isVgaReady: boolean): IsVgaReadyAction => ({
        type: AppEvent.IS_VGA_READY,
        payload: { isVgaReady }
    })
};

export const appReducer = handleActions(
    {
        [AppEvent.DEVICES]: (state: AppState, action) => ({
            ...state,
            event: AppEvent.DEVICES,
            devices: action.payload.devices
        }),
        [AppEvent.VGA_ANSWERS]: (state: AppState, action) => ({
            ...state,
            event: AppEvent.VGA_ANSWERS,
            vgaAnswers: action.payload.vgaAnswers
        }),
        [AppEvent.IS_VGA_READY]: (state: AppState, action) => ({
            ...state,
            event: AppEvent.IS_VGA_READY,
            isVgaReady: action.payload.isVgaReady
        })
    },
    defaultAppState
);
