import { message } from "antd";
import { useEffect } from "react";
import { BrowserRouter } from "react-router";
import Routes from "./routes";
import AuthRouter from "./routes/utils/authRouter";

const networkStatus = () => {
	message.error("网络连接已断开");
};

const App = () => {
	useEffect(() => {
		window.addEventListener("offline", networkStatus);

		return () => {
			window.removeEventListener("offline", networkStatus);
		};
	}, []);
	return (
		<BrowserRouter>
			<AuthRouter>
				<Routes />
			</AuthRouter>
		</BrowserRouter>
	);
};

export default App;
