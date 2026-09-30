import React, { useEffect } from 'react';

export const App: React.FC = () => {
    useEffect(() => {
        console.log('App::onMount()');
        createWs();
    }, []);
    return (
        <div>
            <p>App!</p>
            <div>
                <button onClick={wsBlue}>SET RGB=BLUE</button>
            </div>
            <div>
                <button onClick={wsRed}>SET RGB=RED</button>
            </div>
            <div>
                <button onClick={wsGreen}>SET RGB=GREEN</button>
            </div>
        </div>
    );
};

let myWs: WebSocket;

function createWs() {
    myWs = new WebSocket('ws://localhost:3000');
    myWs.onopen = function () {
        console.log('подключился');
    };
    myWs.onmessage = function (message) {
        console.log('%s', message.data);
    };

    myWs.onclose = function () {
        console.log('отключился. Автоподключение через 5 сек...');
        setTimeout(() => {
            console.log('Попытка подключения к WS');
            createWs();
        }, 5000);
    };
}

function wsBlue() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '1,0,0,255' }));
}

function wsRed() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '1,255,0,0' }));
}

function wsGreen() {
    myWs.send(JSON.stringify({ action: 'TO_SERIAL', data: '1,0,255,0' }));
}
