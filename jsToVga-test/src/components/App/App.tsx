import { AppControllerForUI } from '@src/AppController.types';
import { AppState } from '@src/appReducer';
import { toMMSS } from '@src/util';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface AppProps {
    ctrl: AppControllerForUI;
}

const selectVgaAnswers = (state: { app: AppState }) => state.app.vgaAnswers;
const selectIsVgaReady = (state: { app: AppState }) => state.app.isVgaReady;

export const App: React.FC<AppProps> = ({ ctrl }) => {
    const [command, setCommand] = useState<string>('');
    const [timer, setTimer] = useState<number>(0);
    const vgaAnswers = useSelector(selectVgaAnswers);
    const isVgaReady = useSelector(selectIsVgaReady);

    useEffect(() => {
        ctrl.onAppMount();

        setTimeout(() => {
            // wsClearScreen();
        }, 1000);

        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        ctrl.onTimer(timer);
    }, [timer]);

    const onCommandChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(evt.target.value);
    };

    const wsSendCommand = () => {
        ctrl.wsSend(command);
    };

    return (
        <div>
            <p>VGA: {isVgaReady ? 'Ready' : 'Waiting...'}</p>
            <div>
                Command: <input type="text" value={command} onChange={onCommandChange}></input>
                <button onClick={wsSendCommand}>Send to VGA</button>
            </div>
            <div>
                <textarea id="VGA-answers" rows={30} cols={50} value={vgaAnswers} readOnly />
            </div>
            <div>
                <button onClick={ctrl.wsClearScreen}>Clear screen \cl</button>
            </div>
            <div>Timer: {toMMSS(timer)}</div>
        </div>
    );
};
