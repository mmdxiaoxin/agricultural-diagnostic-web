import { HOME_URL } from "@/config/config";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setTabsList } from "@/store/modules/tabsSlice";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import { useLocation, useNavigate } from "react-router";

export type MoreButtonProps = {
	delTabs: (tabPath?: string) => void;
};

const MoreButton = ({ delTabs }: MoreButtonProps) => {
	const { pathname } = useLocation();
	const navigate = useNavigate();
	const { tabsList } = useAppSelector(state => state.tabs);
	const dispatch = useAppDispatch();

	// close multipleTab
	const closeMultipleTab = (tabPath?: string) => {
		const handleTabsList = tabsList.filter((item: Menu.MenuOptions) => {
			return item.path === tabPath || item.path === HOME_URL;
		});
		dispatch(setTabsList(handleTabsList));
		tabPath ?? navigate(HOME_URL);
	};

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: <span>{"关闭当前"}</span>,
			onClick: () => delTabs(pathname)
		},
		{
			key: "2",
			label: <span>{"关闭其他"}</span>,
			onClick: () => closeMultipleTab(pathname)
		},
		{
			key: "3",
			label: <span>{"关闭所有"}</span>,
			onClick: () => closeMultipleTab()
		}
	];

	return (
		<Dropdown
			menu={{ items }}
			placement="bottom"
			arrow={{ pointAtCenter: true }}
			trigger={["click"]}
		>
			<Button className="more-button" type="text" size="small">
				{"更多"} <DownOutlined />
			</Button>
		</Dropdown>
	);
};
export default MoreButton;
