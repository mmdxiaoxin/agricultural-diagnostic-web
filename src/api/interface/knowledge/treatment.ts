import { TreatmentType } from "@/enums/treatment.enum";

export type Treatment = {
	id: number;
	diseaseId: number;
	type: TreatmentType;
	method: string;
	recommendedProducts: string;
	createdAt: string;
	updatedAt: string;
};
