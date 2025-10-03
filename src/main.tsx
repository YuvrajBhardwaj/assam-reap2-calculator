import "cesium/Build/Cesium/Widgets/widgets.css";
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Modal from 'react-modal';
import { HelmetProvider } from 'react-helmet-async';
import { useNetworkVisibility } from './hooks/useNetworkVisibility';

// Set the app element for react-modal
Modal.setAppElement('#root');

// const { isHidden } = useNetworkVisibility(); // initializes interceptor & applies visibility

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
