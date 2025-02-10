import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const CollapseIcon = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);
	const dispatch = useAppDispatch();
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
