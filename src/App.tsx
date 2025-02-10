import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearToken, setToken } from "./store/modules/authSlice";
import { setPlatformInfo } from "./store/modules/platformSlice";

const App = () => {
	const dispatch = useDispatch();
	const token = useSelector((state: any) => state.auth.token);
	const platformInfo = useSelector((state: any) => state.platform);

	// 模拟获取 token 和平台信息
	useEffect(() => {
		// 假设从 API 获取到 token
		const tokenFromAPI = "your-token-here";
		dispatch(setToken(tokenFromAPI));

		// 假设从 API 获取到平台信息
		const platformFromAPI = {
			platformName: "Windows",
			platformVersion: "10.0"
		};
		dispatch(setPlatformInfo(platformFromAPI));
	}, [dispatch]);

	return (
		<div>
			<h1>Token: {token}</h1>
			<button onClick={() => dispatch(clearToken())}>Clear Token</button>

			<h2>Platform: {platformInfo.platformName}</h2>
			<h3>Version: {platformInfo.platformVersion}</h3>
		</div>
	);
};

export default App;
