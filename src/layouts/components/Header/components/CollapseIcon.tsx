import { RootState } from "@/store";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

const CollapseIcon = () => {
	const isCollapse = useSelector((state: RootState) => state.menu.isCollapse);
	const dispatch = useDispatch();
	return (
		<div
			className="collapsed"
			onClick={() => {
				dispatch(setCollapse(!isCollapse));
			}}
		>
			{isCollapse ? <MenuUnfoldOutlined id="isCollapse" /> : <MenuFoldOutlined id="isCollapse" />}
		</div>
	);
};

export default CollapseIcon;
