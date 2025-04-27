export interface ModelVersion {
	created_at: string;
	description: string;
	file_hash: string;
	file_path: string;
	file_size: number;
	model_id: number;
	model_type: "yolo" | "resnet";
	model_version: string;
	parameters: {
		conf?: number;
		iou?: number;
		half?: boolean;
		img_size?: number;
		[key: string]: any;
	};
	task_types: ("detect" | "classify")[];
	updated_at: string;
	version: string;
	version_id: number;
}

export interface ModelVersions {
	[key: string]: ModelVersion[];
}

export interface ModelResponse {
	code: number;
	data: {
		versions: ModelVersions;
	};
	message: string;
}

export interface ModelConfig {
	id: string;
	name: string;
	model_type: "yolo" | "resnet";
	model_version: string;
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
