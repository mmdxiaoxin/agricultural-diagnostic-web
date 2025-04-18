import logo from "@/assets/images/logo.svg";
import { useAppSelector } from "@/hooks/useAppSelector";
import clsx from "clsx";

const Logo = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);

	return (
		<div
			className={clsx(
				"flex flex-col items-center justify-center h-[93px]",
				"[&_.logo-img]:w-[50px] [&_.logo-img]:m-0",
				"[&_.logo-text]:m-0 [&_.logo-text]:text-[24px] [&_.logo-text]:font-bold [&_.logo-text]:whitespace-nowrap"
			)}
		>
			<img src={logo} alt="logo" className="logo-img" />
			{!isCollapse ? <h2 className="logo-text">病害智能诊断系统</h2> : null}
		</div>
	);
};

export default Logo;
