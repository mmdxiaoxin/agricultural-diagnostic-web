import logo from "@/assets/images/logo.png";
import { useAppSelector } from "@/hooks/useAppSelector";

const Logo = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);

	return (
		<div className="logo-box">
			<img src={logo} alt="logo" className="logo-img" />
			{!isCollapse ? <h2 className="logo-text">智能诊断系统</h2> : null}
		</div>
	);
};

export default Logo;
