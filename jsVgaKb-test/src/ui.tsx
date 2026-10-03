import React from 'react';
import ReactDom from 'react-dom';
import { App } from './components/App';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppController } from './AppController';

const ctrl = new AppController();

ReactDom.render(
    <Provider store={store}>
        <App ctrl={ctrl} />
    </Provider>,
    document.getElementById('root')
);
