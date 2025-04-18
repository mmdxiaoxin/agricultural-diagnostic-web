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
						"footer",
						"flex items-center justify-center py-[10px]",
						"border-t border-solid border-[#e4e7ed]",
						"[&_a]:text-[14px] [&_a]:text-[#858585] [&_a]:no-underline [&_a]:tracking-[0.5px] [&_a]:whitespace-nowrap",
						"[&_a:hover]:text-blue-500 [&_a:hover]:transition-colors"
					)}
				>
					<a href="http://www.spicyboy.cn/" target="_blank" rel="noreferrer">
						2025 © mmdxiaoxin By NWAFU.
					</a>
				</Footer>
			)}
		</>
	);
};

export default LayoutFooter;
