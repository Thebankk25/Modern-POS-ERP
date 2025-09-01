
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { InventoryProvider } from './hooks/useInventory';
import { AiProvider } from './hooks/useAi';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <InventoryProvider>
      <AiProvider>
        <App />
      </AiProvider>
    </InventoryProvider>
  </React.StrictMode>
);
