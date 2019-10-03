import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'antd/dist/antd.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
import * as serviceWorker from './serviceWorker';
import {createStore,combineReducers} from 'redux'
import { Provider } from 'react-redux';
import reducer from './Reducer/baseReducer'
import {Route, NavLink, withRouter, Redirect,BrowserRouter } from 'react-router-dom';


const store = createStore(reducer);


ReactDOM.render(<Provider store={store} > <BrowserRouter basename='/webgismap'><App /></BrowserRouter> </Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
