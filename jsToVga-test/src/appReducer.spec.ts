import { bool, getFromState, getVal, rndAr, rndSize, str } from './testFramework';
import { defaultAppState, app, AppEvent, appReducer, AppState } from './appReducer';
import { defaultDevice, Device } from './app.types';
import { Action } from 'redux-actions';

describe('appReducer', () => {
    const rndDevices: Device[] = rndAr(
        rndSize(1, 3),
        (): Device => ({ ...defaultDevice })
    ) as Device[];
    const rndStr = str();
    const rndBool = bool();

    test.each`
        actions                      | testName                                               | event                    | stateSelector   | value
        ${[app.devices(rndDevices)]} | ${'sets .devices for AppEvent.DEVICES action'}         | ${AppEvent.DEVICES}      | ${'devices'}    | ${rndDevices}
        ${[app.vgaAnswers(rndStr)]}  | ${'sets .vgaAnswers for AppEvent.VGA_ANSWERS action'}  | ${AppEvent.VGA_ANSWERS}  | ${'vgaAnswers'} | ${rndStr}
        ${[app.isVgaReady(rndBool)]} | ${'sets .isVgaReady for AppEvent.IS_VGA_READY action'} | ${AppEvent.IS_VGA_READY} | ${'isVgaReady'} | ${rndBool}
    `('$testName', async ({ actions, event, stateSelector, value }) => {
        let state: AppState = { ...defaultAppState };
        actions.forEach((action: Action<AppState>) => {
            state = appReducer(state, action);
        });
        expect(state.event).toEqual(event);
        if (stateSelector !== null) {
            expect(getFromState(state, stateSelector)).toEqual(getVal(actions, value));
        }
    });
});
