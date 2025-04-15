export interface ModelConfig {
	id: string;
	name: string;
	type: "yolo" | "resnet" | "other";
	version: string;
	description: string;
	weightPath: string;
	configPath: string;
	parameters: {
		confidence: number;
		iou: number;
		batchSize: number;
		[key: string]: any;
	};
	status: "active" | "inactive";
	createdAt: string;
	updatedAt: string;
}

export interface ModelParameter {
	name: string;
	type: "number" | "boolean" | "string";
	value: any;
	min?: number;
	max?: number;
	step?: number;
	description: string;
}
