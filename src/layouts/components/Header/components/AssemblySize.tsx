import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setComponentSize } from "@/store/modules/globalSlice";
import { FontSizeOutlined } from "@ant-design/icons";
import { Button, Dropdown, MenuProps } from "antd";
import styles from "../index.module.scss";
import clsx from "clsx";

const AssemblySize = () => {
	const { componentSize } = useAppSelector(state => state.global);
	const dispatch = useAppDispatch();

	const onClick = (e: MenuInfo) => {
		const size = e.key as "middle" | "large" | "small";
		dispatch(setComponentSize(size));
	};

	const items: MenuProps["items"] = [
		{
			key: "middle",
			disabled: componentSize == "middle",
			label: <span>默认</span>,
			onClick
		},
		{
			disabled: componentSize == "large",
			key: "large",
			label: <span>大型</span>,
			onClick
		},
		{
			disabled: componentSize == "small",
			key: "small",
			label: <span>小型</span>,
			onClick
		}
	];

	return (
		<Dropdown menu={{ items }} placement="bottom" trigger={["click"]} arrow={true}>
			<Button
				type="text"
				className={clsx(
					"mr-[22px] text-[19px] leading-[19px] cursor-pointer text-[rgba(0,0,0,0.85)]"
				)}
				icon={<FontSizeOutlined />}
			/>
		</Dropdown>
	);
};

export default AssemblySize;
