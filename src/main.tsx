import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.tsx";
import "./styles/index.css";
import { persistor, store } from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider store={store}>
			<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</StrictMode>
);
