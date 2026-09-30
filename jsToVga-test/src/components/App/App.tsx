import React, { useEffect, useState } from 'react';

const addZeros = (val: number): string => `${val < 1 ? '00' : val < 10 ? '0' + val : val}`;

const toMMSS = (sec: number) => {
    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    return `${addZeros(mm)}:${addZeros(ss)}`;
};

export const App: React.FC = () => {
    const [command, setCommand] = useState<string>('');
    const [timer, setTimer] = useState<number>(0);

    useEffect(() => {
        console.log('App::onMount()');
        createWs();

        setTimeout(() => {
            wsClearScreen();
        }, 1000);

        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        wsSend('\\cl' + toMMSS(timer));
    }, [timer]);

    const onCommandChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setCommand(evt.target.value);
    };

    const wsSendCommand = () => {
        wsSend(command);
    };

    return (
        <div>
            <p>App!</p>
            <div>
                Command: <input type="text" value={command} onChange={onCommandChange}></input>
                <button onClick={wsSendCommand}>Send to VGA</button>
            </div>
            <div>
                <textarea id="VGA-answers" rows={30} cols={50} />
            </div>
            <div>
                <button onClick={wsClearScreen}>Clear screen \cl</button>
            </div>
            <div>
                <button onClick={wsRed}>SET RGB=RED</button>
            </div>
            <div>
                <button onClick={wsGreen}>SET RGB=GREEN</button>
            </div>
            <div>Timer: {toMMSS(timer)}</div>
        </div>
    );
};

let myWs: WebSocket;

function createWs() {
    myWs = new WebSocket('ws://localhost:3000');
    myWs.onopen = function () {
        console.log('connected');
    };
    myWs.onmessage = function (message) {
        console.log('%s', message.data);
        const answersEl = document.getElementById('VGA-answers');
        if (answersEl) {
            (answersEl as HTMLInputElement).value += `${message.data}`;
        }
    };

    myWs.onclose = function () {
        console.log('disconnected. Autoconnect in 5 s...');
        setTimeout(() => {
            console.log('Trying to connect to WS');
            createWs();
        }, 5000);
    };
}

function wsSend(text: string) {
    if (myWs.readyState === WebSocket.OPEN) {
        myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: text }));
    } else {
        console.warn('WebSocket is not connected');
    }
}

function wsClearScreen() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '\\cl' }));
}

function wsRed() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '1,255,0,0' }));
}

function wsGreen() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '1,0,255,0' }));
}
