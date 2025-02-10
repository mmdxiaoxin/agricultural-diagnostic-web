import { useAppSelector } from "@/hooks/useAppSelector";
import "./index.scss";

const LayoutFooter = () => {
	const { themeConfig } = useAppSelector(state => state.global);

	return (
		<>
			{!themeConfig.footer && (
				<div className="footer">
					<a href="http://www.spicyboy.cn/" target="_blank" rel="noreferrer">
						2025 © mmdxiaoxin By NWAFU.
					</a>
				</div>
			)}
		</>
	);
};

export default LayoutFooter;
