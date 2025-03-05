import { Flex, Splitter, Typography } from "antd";
import clsx from "clsx";
import React from "react";

const Desc: React.FC<Readonly<{ text?: string | number }>> = props => (
	<Flex justify="center" align="center" style={{ height: "100%" }}>
		<Typography.Title type="secondary" level={5} style={{ whiteSpace: "nowrap" }}>
			{props.text}
		</Typography.Title>
	</Flex>
);

const ServiceConfig: React.FC = () => {
	return (
		<Splitter className={clsx("w-full h-full", "bg-white", "rounded-lg")}>
			<Splitter.Panel defaultSize="40%" min="20%" max="70%">
				<Desc text="First" />
			</Splitter.Panel>
			<Splitter.Panel>
				<Desc text="Second" />
			</Splitter.Panel>
		</Splitter>
	);
};

export default ServiceConfig;
