import { DiagnosisRule } from "./diagnosis-rule";
import { EnvironmentFactor } from "./environment-factor";
import { Symptom } from "./symptom";
import { Treatment } from "./treatment";

export type Disease = {
	id: number;
	name: string;
	alias: string;
	cropId: number;
	cause: string;
	transmission: string;
	symptoms: Symptom[];
	treatments: Treatment[];
	environmentFactors: EnvironmentFactor[];
	diagnosisRules: DiagnosisRule[];
	createdAt: string;
	updatedAt: string;
};
