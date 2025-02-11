import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setThemeConfig } from "@/store/modules/globalSlice";
import { Switch } from "antd";

const SwitchDark = () => {
	const { themeConfig } = useAppSelector(state => state.global);
	const dispatch = useAppDispatch();

	const onChange = (checked: boolean) => {
		dispatch(setThemeConfig({ ...themeConfig, isDark: checked }));
	};

	return (
		<Switch
			className="dark"
			defaultChecked={themeConfig.isDark}
			checkedChildren={<>🌞</>}
			unCheckedChildren={<>🌜</>}
			onChange={onChange}
		/>
	);
};

export default SwitchDark;
