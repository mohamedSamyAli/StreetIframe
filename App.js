import React from 'react';
import MapComponent from './Component/MapComponent/MapComponent'
import MapControlsComponent from './Component//MapControls/MapControlsComponent'
import {Router,Route, NavLink, withRouter, Redirect,BrowserRouter } from 'react-router-dom';


import './App.css';

function App() {



  return (
    <div className="App">
   
  <Route path='/' component={MapControlsComponent} />
    {/* <MapControlsComponent ></MapControlsComponent> */}
  {/* … */}

    </div>
  );
}

export default App;
