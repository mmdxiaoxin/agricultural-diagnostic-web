import { useAppSelector } from "@/hooks/useAppSelector";
import { Layout } from "antd";
import styles from "./index.module.scss";

const LayoutFooter = () => {
	const { themeConfig } = useAppSelector(state => state.global);
	const { Footer } = Layout;

	return (
		<>
			{!themeConfig.footer && (
				<Footer className={styles.footer}>
					<a href="http://www.spicyboy.cn/" target="_blank" rel="noreferrer">
						2025 © mmdxiaoxin By NWAFU.
					</a>
				</Footer>
			)}
		</>
	);
};

export default LayoutFooter;
