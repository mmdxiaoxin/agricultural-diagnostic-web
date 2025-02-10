import { useSelector } from "react-redux";
import logo from "@/assets/images/logo.png";
import { RootState } from "@/store";

const Logo = () => {
	// 使用 useSelector 从 Redux store 中获取 isCollapse 状态
	const isCollapse = useSelector((state: RootState) => state.menu.isCollapse);

	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{!isCollapse ? <h2 className="logo-text">Argi Diag</h2> : null}
		</div>
	);
};

export default Logo;
