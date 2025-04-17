import http from "@/api";
import { PageData, ReqPage } from "@/api/interface";
import { Symptom } from "@/api/interface/knowledge/symptom";

// * 获取病害列表
export const getSymptoms = async () => {
	return http.get<Symptom[]>("/knowledge/symptom", {}, { loading: false });
};

// * 获取病害症状列表
export const getSymptomList = async (params: ReqPage) => {
	return http.get<PageData<Symptom>>("/knowledge/symptom/list", params, { loading: false });
};

// * 获取病害症状图片
export const getSymptomImage = async (id: number) => {
	return http.get<string>(
		`/knowledge/symptom/${id}/image`,
		{},
		{ responseType: "blob", loading: false }
	) as unknown as Promise<Blob>;
};

// * 创建病害症状
export const createSymptom = async (data: Symptom) => {
	return http.post<Symptom>("/knowledge/symptom", data, { loading: false });
};

// * 更新病害症状
export const updateSymptom = async (id: number, data: Symptom) => {
	return http.patch<Symptom>(`/knowledge/symptom/${id}`, data, { loading: false });
};

// * 删除病害症状
export const deleteSymptom = async (id: number) => {
	return http.delete<Symptom>(`/knowledge/symptom/${id}`, { loading: false });
};

// * 根据疾病获取病害症状
export const getSymptomsByDiseaseId = async (diseaseId: number) => {
	return http.get<Symptom[]>(`/knowledge/symptom/disease/${diseaseId}`, {}, { loading: false });
};

// * 根据疾病获取病害症状
export const getSymptomListByDiseaseId = async (diseaseId: number, params: ReqPage) => {
	return http.get<PageData<Symptom>>(`/knowledge/symptom/disease/${diseaseId}/list`, params, {
		loading: false
	});
};
