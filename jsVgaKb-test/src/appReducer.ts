import { handleActions } from 'redux-actions';
import { Device } from './app.types';

export enum AppEvent {
    DEFAULT = '',
    DEVICES = 'APP/DEVICES',
    VGA_ANSWERS = 'APP/VGA_ANSWERS',
    IS_VGA_READY = 'APP/IS_VGA_READY',
    IS_KB_READY = 'APP/IS_KB_READY'
}

export interface AppState {
    event: AppEvent;
    devices: Device[];
    vgaAnswers: string;
    isVgaReady: boolean;
    isKbReady: boolean;
}

export const defaultAppState: AppState = {
    event: AppEvent.DEFAULT,
    devices: [],
    vgaAnswers: '',
    isVgaReady: false,
    isKbReady: false
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

export interface IsKbReadyAction {
    type: AppEvent.IS_KB_READY;
    payload: {
        isKbReady: boolean;
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
    }),
    isKbReady: (isKbReady: boolean): IsKbReadyAction => ({
        type: AppEvent.IS_KB_READY,
        payload: { isKbReady }
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
        }),
        [AppEvent.IS_KB_READY]: (state: AppState, action) => ({
            ...state,
            event: AppEvent.IS_KB_READY,
            isKbReady: action.payload.isKbReady
        })
    },
    defaultAppState
);
