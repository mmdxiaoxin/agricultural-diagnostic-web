export const DIAGNOSIS_STATUS = {
	PENDING: "pending",
	SUCCESS: "success",
	FAILED: "failed",
	PROCESSING: "processing"
} as const;

export const DIAGNOSIS_STATUS_COLOR = {
	[DIAGNOSIS_STATUS.PENDING]: "blue",
	[DIAGNOSIS_STATUS.SUCCESS]: "green",
	[DIAGNOSIS_STATUS.FAILED]: "red",
	[DIAGNOSIS_STATUS.PROCESSING]: "orange"
} as const;

export const DIAGNOSIS_STATUS_TEXT = {
	[DIAGNOSIS_STATUS.PENDING]: "待诊断",
	[DIAGNOSIS_STATUS.SUCCESS]: "已完成",
	[DIAGNOSIS_STATUS.FAILED]: "诊断失败",
	[DIAGNOSIS_STATUS.PROCESSING]: "诊断中"
} as const;

export const FEEDBACK_STATUS = {
	PENDING: "pending",
	PROCESSING: "processing",
	RESOLVED: "resolved",
	REJECTED: "rejected"
} as const;

export const FEEDBACK_STATUS_TEXT = {
	[FEEDBACK_STATUS.PENDING]: "待处理",
	[FEEDBACK_STATUS.PROCESSING]: "处理中",
	[FEEDBACK_STATUS.RESOLVED]: "已解决",
	[FEEDBACK_STATUS.REJECTED]: "已驳回"
} as const;

export const FEEDBACK_STATUS_COLOR = {
	[FEEDBACK_STATUS.PENDING]: "blue",
	[FEEDBACK_STATUS.PROCESSING]: "orange",
	[FEEDBACK_STATUS.RESOLVED]: "green",
	[FEEDBACK_STATUS.REJECTED]: "red"
} as const;
