import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button } from "antd";
import clsx from "clsx";

const CollapseIcon = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);
	const dispatch = useAppDispatch();
	return (
		<Button
			type="text"
			icon={
				isCollapse ? <MenuUnfoldOutlined id="isCollapse" /> : <MenuFoldOutlined id="isCollapse" />
			}
			className={clsx("mr-[20px] text-[18px] cursor-pointer transition-colors")}
			onClick={() => {
				dispatch(setCollapse(!isCollapse));
			}}
		></Button>
	);
};

export default CollapseIcon;
