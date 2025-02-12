import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setLanguage } from "@/store/modules/globalSlice";
import { TranslationOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import styles from "../index.module.scss";

const Language = () => {
	const { language } = useAppSelector(state => state.global);
	const dispatch = useAppDispatch();

	const items: MenuProps["items"] = [
		{
			key: "1",
			label: <span>简体中文</span>,
			onClick: () => dispatch(setLanguage("zhCN")),
			disabled: language === "zhCN"
		},
		{
			key: "2",
			label: <span>English</span>,
			onClick: () => dispatch(setLanguage("enUS")),
			disabled: language === "enUS"
		}
	];
	return (
		<Dropdown menu={{ items }} placement="bottom" trigger={["click"]} arrow={true}>
			<Button type="text" className={styles["icon-style"]} icon={<TranslationOutlined />} />
		</Dropdown>
	);
};

export default Language;
