import http from "@/api";
import { ReqAiServiceList, ResAiServiceList } from "@/api/interface/service";

export const getServices = (params: ReqAiServiceList) => {
	return http.get<ResAiServiceList>("/ai-service/list", params);
};
