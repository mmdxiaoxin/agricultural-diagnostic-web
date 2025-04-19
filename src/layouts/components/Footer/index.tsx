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
						"flex items-center justify-center",
						"py-2 lg:py-3",
						"px-4 lg:px-6",
						"border-t border-solid border-[#e4e7ed]",
						"h-auto max-h-[20px] lg:max-h-[30px]"
					)}
				>
					<a
						href="http://www.spicyboy.cn/"
						target="_blank"
						rel="noreferrer"
						className={clsx(
							"text-xs lg:text-sm",
							"text-[#858585]",
							"no-underline",
							"tracking-[0.5px]",
							"whitespace-nowrap",
							"hover:text-blue-500",
							"hover:transition-colors",
							"text-center"
						)}
					>
						2025 © mmdxiaoxin By NWAFU.
					</a>
				</Footer>
			)}
		</>
	);
};

export default LayoutFooter;
