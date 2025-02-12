import logo from "@/assets/images/logo.svg";
import { useAppSelector } from "@/hooks/useAppSelector";
import styles from "../index.module.scss";

const Logo = () => {
	const isCollapse = useAppSelector(state => state.menu.isCollapse);

	return (
		<div className={styles["logo-box"]}>
			<img src={logo} alt="logo" className={styles["logo-img"]} />
			{!isCollapse ? <h2 className={styles["logo-text"]}>病害智能诊断系统</h2> : null}
		</div>
	);
};

export default Logo;
