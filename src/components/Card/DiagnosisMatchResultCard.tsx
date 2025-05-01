import { MatchResult } from "@/api/interface/knowledge";
import { MATCH_RULE_TYPE } from "@/constants/knowledge";
import { BookOutlined, EnvironmentOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import { Button, Card, Space, Tag, Typography } from "antd";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const { Title, Paragraph } = Typography;

interface DiagnosisMatchResultCardProps {
	matchResult: MatchResult;
}

const DiagnosisMatchResultCard: React.FC<DiagnosisMatchResultCardProps> = ({ matchResult }) => {
	const navigate = useNavigate();
	const { disease } = matchResult;

	const handleNavigate = () => {
		navigate(`/knowledge/preview?id=${disease.id}`);
	};

	return (
		<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
			<Card
				className={clsx(
					"hover:shadow-lg transition-shadow",
					"border border-gray-100",
					"rounded-xl"
				)}
			>
				<Space direction="vertical" className="w-full">
					{/* 标题和匹配分数 */}
					<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
						<Title level={4} className="!mb-0">
							{disease.name}
						</Title>
						<Space>
							<Tag color="blue" className="text-sm">
								匹配度: {(matchResult.score * 100).toFixed(1)}%
							</Tag>
							<Button
								type="primary"
								icon={<BookOutlined />}
								onClick={handleNavigate}
								size="small"
								className="!flex items-center gap-1"
							>
								查看详情
							</Button>
						</Space>
					</div>

					{/* 别名和作物信息 */}
					<div className="flex items-center gap-2">
						<Tag color="green" className="text-xs">
							{disease.crop?.name}
						</Tag>
						<span className="text-xs text-gray-500">{disease.alias}</span>
					</div>

					{/* 匹配规则 */}
					<div className="bg-gray-50 p-3 rounded-lg">
						<Title level={5} className="!mb-2">
							匹配规则
						</Title>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{matchResult.matchedRules.map((rule, index) => (
								<div key={index} className="bg-white p-2 rounded-md border border-gray-100">
									<div className="flex items-center gap-1">
										<Tag color="purple" className="text-xs">
											{MATCH_RULE_TYPE[rule.type]}
										</Tag>
										<span className="text-xs font-medium">{rule.field}</span>
									</div>
									<Paragraph className="text-xs !mb-0 mt-1">{rule.value}</Paragraph>
								</div>
							))}
						</div>
					</div>

					{/* 病害信息 */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="flex items-center gap-1 mb-2">
								<MedicineBoxOutlined className="text-blue-500" />
								<Title level={5} className="!mb-0">
									病因
								</Title>
							</div>
							<Paragraph className="text-sm !mb-0">{disease.cause}</Paragraph>
						</div>
						<div className="bg-gray-50 p-3 rounded-lg">
							<div className="flex items-center gap-1 mb-2">
								<EnvironmentOutlined className="text-green-500" />
								<Title level={5} className="!mb-0">
									传播方式
								</Title>
							</div>
							<Paragraph className="text-sm !mb-0">{disease.transmission}</Paragraph>
						</div>
					</div>
				</Space>
			</Card>
		</motion.div>
	);
};

export default DiagnosisMatchResultCard;
