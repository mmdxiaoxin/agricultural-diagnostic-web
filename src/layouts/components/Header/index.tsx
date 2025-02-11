import { Layout } from "antd";
import AssemblySize from "./components/AssemblySize";
import AvatarIcon from "./components/AvatarIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import CollapseIcon from "./components/CollapseIcon";
import Fullscreen from "./components/Fullscreen";
import Language from "./components/Language";
import Theme from "./components/Theme";
import "./index.scss";

const LayoutHeader = () => {
	const { Header } = Layout;

	return (
		<Header>
			<div className="header-lf">
				<CollapseIcon />
				<BreadcrumbNav />
			</div>
			<div className="header-ri">
				<Language />
				<AssemblySize />
				<Theme />
				<Fullscreen />
				<AvatarIcon />
			</div>
		</Header>
	);
};

export default LayoutHeader;
