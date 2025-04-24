import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AgroWebApp } from './AgroWebApp';
import { Provider } from 'react-redux';
import { store } from './store';
import './css/styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
	<Provider store={ store }>
		<HashRouter>
			<AgroWebApp />
		</HashRouter>    
	</Provider>
	</React.StrictMode>,
)
