import { ReqPage } from "..";
import { Crop } from "./crop";
import { DiagnosisRule } from "./diagnosis-rule";
import { EnvironmentFactor } from "./environment-factor";
import { Symptom } from "./symptom";
import { Treatment } from "./treatment";

export type Disease = {
	id: number;
	name: string;
	alias: string;
	cropId: number;
	crop?: Crop;
	cause: string;
	transmission: string;
	symptoms: Symptom[];
	treatments: Treatment[];
	environmentFactors: EnvironmentFactor[];
	diagnosisRules: DiagnosisRule[];
	createdAt: string;
	updatedAt: string;
};
export type ReqCreateDisease = Omit<Disease, "id" | "createdAt" | "updatedAt">;
export type ReqUpdateDisease = Partial<ReqCreateDisease>;
export type ReqDiseaseList = ReqPage & {
	cropId?: number;
	keyword?: string;
};
