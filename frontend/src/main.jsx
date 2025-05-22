import {createContext, StrictMode} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import UserStore from "./store/UserStore";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

export const Context = createContext(null);

const user = new UserStore();

createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Context.Provider value={{
          user: user,
      }}>
        <App />
      </Context.Provider>
    </StrictMode>,
)
