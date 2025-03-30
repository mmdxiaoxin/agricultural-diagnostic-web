import { Disease } from "./disease";

export type Crop = {
	id: number;
	name: string;
	scientificName: string;
	growthStage: string;
	diseases: Disease[];
	createdAt: string;
	updatedAt: string;
};
