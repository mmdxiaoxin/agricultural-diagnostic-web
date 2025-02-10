import { BrowserRouter } from "react-router";
import Routes from "./routes";
import AuthRouter from "./routes/utils/authRouter";
import "@/styles/theme/theme-default.scss";

const App = () => {
	return (
		<BrowserRouter>
			<AuthRouter>
				<Routes />
			</AuthRouter>
		</BrowserRouter>
	);
};

export default App;
