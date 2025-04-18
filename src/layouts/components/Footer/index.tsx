import { useAppSelector } from "@/hooks/useAppSelector";
import { Layout } from "antd";
import clsx from "clsx";

const LayoutFooter = () => {
	const { themeConfig } = useAppSelector(state => state.global);
	const { Footer } = Layout;

	return (
		<>
			{!themeConfig.footer && (
				<Footer
					className={clsx(
						"flex items-center justify-center py-[10px]",
						"border-t border-solid border-[#e4e7ed]"
					)}
				>
					<a
						href="http://www.spicyboy.cn/"
						target="_blank"
						rel="noreferrer"
						className="text-[14px] text-[#858585] no-underline tracking-[0.5px] whitespace-nowrap hover:text-blue-500 hover:transition-colors"
					>
						2025 © mmdxiaoxin By NWAFU.
					</a>
				</Footer>
			)}
		</>
	);
};

export default LayoutFooter;
