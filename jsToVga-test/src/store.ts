import { combineReducers } from 'redux';
import { createStore } from 'redux';
import { appReducer } from './appReducer';

export const reducerAll = combineReducers({
    app: appReducer
});

export interface AppState {}

export const defaultState: AppState = {};

export const store = createStore(
    reducerAll,
    window['__REDUX_DEVTOOLS_EXTENSION__'] && window['__REDUX_DEVTOOLS_EXTENSION__']()
);
