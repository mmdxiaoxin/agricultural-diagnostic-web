export const DEFAULT_CONFIG_TEMPLATE = {
	result: 2,
	requests: [
		{
			id: 5,
			next: [2],
			type: "single",
			order: 1,
			params: {
				file: "image",
				version: "1.0",
				model_name: "resnet50"
			}
		},
		{
			id: 2,
			type: "polling",
			delay: 1000,
			order: 2,
			params: {
				taskId: "{{#5.data.task_id}}"
			},
			timeout: 100000,
			interval: 5000,
			maxAttempts: 5,
			pollingCondition: {
				field: "data.status",
				value: "success",
				operator: "equals"
			}
		}
	]
};
