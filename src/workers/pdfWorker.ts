/// <reference lib="webworker" />

import { jsPDF } from "jspdf";

interface PDFData {
	disease: {
		name: string;
		crop?: {
			name: string;
		};
		alias: string;
		cause: string;
		transmission: string;
	};
	symptoms: Array<{
		stage: string;
		description: string;
	}>;
	treatments: Array<{
		type: string;
		method: string;
		recommendedProducts?: string;
	}>;
	environmentFactors: Array<{
		factor: string;
		optimalRange: string;
	}>;
}

const worker = self as unknown as Worker;

worker.onmessage = (e: MessageEvent) => {
	const { disease, symptoms, treatments, environmentFactors } = e.data as PDFData;

	try {
		const doc = new jsPDF();

		// 设置标题
		doc.setFontSize(20);
		doc.text(disease.name, 20, 20);

		// 基本信息
		doc.setFontSize(12);
		doc.text(`作物类型: ${disease.crop?.name || "未知"}`, 20, 30);
		doc.text(`别名: ${disease.alias}`, 20, 40);

		// 病因
		doc.text("病因:", 20, 50);
		doc.setFontSize(10);
		doc.text(disease.cause, 20, 60, { maxWidth: 170 });

		// 传播方式
		doc.setFontSize(12);
		doc.text("传播方式:", 20, 80);
		doc.setFontSize(10);
		doc.text(disease.transmission, 20, 90, { maxWidth: 170 });

		// 症状特征
		doc.setFontSize(12);
		doc.text("症状特征:", 20, 110);
		doc.setFontSize(10);
		symptoms.forEach((symptom, index) => {
			const y = 120 + index * 20;
			doc.text(`${symptom.stage}: ${symptom.description}`, 20, y, { maxWidth: 170 });
		});

		// 防治措施
		doc.setFontSize(12);
		doc.text("防治措施:", 20, 160);
		doc.setFontSize(10);
		treatments.forEach((treatment, index) => {
			const y = 170 + index * 20;
			doc.text(`${treatment.type}: ${treatment.method}`, 20, y, { maxWidth: 170 });
			if (treatment.recommendedProducts) {
				doc.text(`推荐产品: ${treatment.recommendedProducts}`, 20, y + 10, { maxWidth: 170 });
			}
		});

		// 环境因素
		doc.setFontSize(12);
		doc.text("环境因素:", 20, 220);
		doc.setFontSize(10);
		environmentFactors.forEach((factor, index) => {
			const y = 230 + index * 20;
			doc.text(`${factor.factor}: ${factor.optimalRange}`, 20, y, { maxWidth: 170 });
		});

		const pdfBlob = doc.output("blob");
		worker.postMessage({ success: true, blob: pdfBlob });
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : "未知错误";
		worker.postMessage({ success: false, error: errorMessage });
	}
};
