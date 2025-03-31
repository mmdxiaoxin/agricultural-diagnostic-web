import { PageData } from "..";
import { Disease } from "./disease";

export type Crop = {
	id: number;
	name: string;
	scientificName?: string;
	growthStage?: string;
	cropType?: string;
	imageUrl?: string;
	alias?: string;
	description?: string;
	origin?: string;
	growthCycle?: string;
	growthHabits?: string;
	suitableArea?: string;
	suitableSeason?: string;
	suitableSoil?: string;
	diseases?: Disease[];
	createdAt: string;
	updatedAt: string;
};

export type ReqCropList = {
	page: number;
	pageSize: number;
	keyword?: string;
};

export type ReqCreateCrop = {
	name: string;
	scientificName: string;
	growthStage: string;
};

export type ReqUpdateCrop = Partial<ReqCreateCrop>;

export type ResCropDetail = Crop;
export type ResCropList = PageData<Crop>;
