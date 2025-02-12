import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setCollapse } from "@/store/modules/menuSlice";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import styles from "../index.module.scss";
import { Button } from "antd";

const CollapseIcon = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);
	const dispatch = useAppDispatch();
	return (
		<Button
			type="text"
			icon={
				isCollapse ? <MenuUnfoldOutlined id="isCollapse" /> : <MenuFoldOutlined id="isCollapse" />
			}
			className={styles["collapsed"]}
			onClick={() => {
				dispatch(setCollapse(!isCollapse));
			}}
		></Button>
	);
};

export default CollapseIcon;
