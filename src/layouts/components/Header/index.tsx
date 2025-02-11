import { Layout } from "antd";
import AvatarIcon from "./components/AvatarIcon";
import BreadcrumbNav from "./components/BreadcrumbNav";
import CollapseIcon from "./components/CollapseIcon";
import Fullscreen from "./components/Fullscreen";
import Theme from "./components/Theme";
import "./index.scss";
import AssemblySize from "./components/AssemblySize";

const LayoutHeader = () => {
	const { Header } = Layout;

	return (
		<Header>
			<div className="header-lf">
				<CollapseIcon />
				<BreadcrumbNav />
			</div>
			<div className="header-ri">
				<AssemblySize />
				<Theme />
				<Fullscreen />
				<AvatarIcon />
			</div>
		</Header>
	);
};

export default LayoutHeader;
