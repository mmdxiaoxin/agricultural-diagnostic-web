export type DiagnosisRule = {
	id: number;
	diseaseId: number;
	symptomIds: string;
	probability: number;
	recommendedAction: string;
	createdAt: string;
	updatedAt: string;
};
