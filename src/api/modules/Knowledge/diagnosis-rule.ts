import http from "@/api";
import { DiagnosisRule, ReqDiagnosisRuleList } from "@/api/interface/knowledge/diagnosis-rule";

// * 获取诊断规则列表
export const getDiagnosisRules = async () =>
	http.get<DiagnosisRule[]>("/api/knowledge/diagnosis-rule", {}, { loading: false });

// * 创建诊断规则
export const createDiagnosisRule = async (schema: string) =>
	http.post<DiagnosisRule>("/api/knowledge/diagnosis-rule", { schema }, { loading: false });

// * 更新诊断规则
export const updateDiagnosisRule = async (ruleId: number, schema: string) =>
	http.put<DiagnosisRule>(
		`/api/knowledge/diagnosis-rule/${ruleId}`,
		{ schema },
		{ loading: false }
	);

// * 删除诊断规则
export const deleteDiagnosisRule = async (ruleId: number) =>
	http.delete<DiagnosisRule>(`/api/knowledge/diagnosis-rule/${ruleId}`, { loading: false });

// * 获取诊断规则详情
export const getDiagnosisRuleDetail = async (ruleId: number) =>
	http.get<DiagnosisRule>(`/api/knowledge/diagnosis-rule/${ruleId}`, {}, { loading: false });

// * 获取诊断规则列表
export const getDiagnosisRulesList = async (params: ReqDiagnosisRuleList) =>
	http.get<DiagnosisRule[]>("/api/knowledge/diagnosis-rule/list", params, { loading: false });
