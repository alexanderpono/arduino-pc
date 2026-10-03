import { defaultDevice, Device } from './app.types';
import { app } from './appReducer';
import { AppStateManager } from './AppStateManager';
import { store } from './store';
import { bool, rndAr, rndSize, str } from './testFramework/reducer';

describe('AppStateManager', () => {
    let dispatchMock: jest.Mock;

    beforeEach(() => {
        dispatchMock = jest.fn();
        jest.spyOn(store, 'dispatch').mockImplementation(dispatchMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('dispatchers', () => {
        const rndDevices: Device[] = rndAr(
            rndSize(1, 3),
            (): Device => ({ ...defaultDevice })
        ) as Device[];
        const rndStr = str();
        const rndBool = bool();

        test.each`
            method                | param1        | param2  | expected
            ${'devices'}          | ${rndDevices} | ${null} | ${app.devices(rndDevices)}
            ${'vgaAnswers'}       | ${rndStr}     | ${null} | ${app.vgaAnswers(rndStr)}
            ${'setAppIsVgaReady'} | ${rndBool}    | ${null} | ${app.isVgaReady(rndBool)}
            ${'setAppIsKbReady'}  | ${rndBool}    | ${null} | ${app.isKbReady(rndBool)}
        `('$method() calls store.dispatch', ({ method, param1, param2, expected }) => {
            dispatchMock.mockClear();

            const model = AppStateManager.create();
            const methodName = method as keyof AppStateManager;
            if (param1 !== null && param2 !== null) {
                (model[methodName] as (p1: string, p2: string) => void)(param1, param2);
            } else if (param1 !== null) {
                (model[methodName] as (p1: string) => void)(param1);
            } else {
                (model[methodName] as () => void)();
            }

            expect(dispatchMock).toHaveBeenCalledWith(expected);
        });
    });
});
