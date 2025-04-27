export * from "./auth";
export * from "./user";
export * from "./role";
export * from "./menu";
export * from "./file";
export * from "./diagnosis";
export * from "./dataset";
export * from "./service";
export * from "./upload";
export * from "./download";

import http from "@/api";

export const testSpeed = async () => {
	const start = new Date().getTime();
	await http.get("/speed-test");
	const end = new Date().getTime();
	const speed = end - start;
	return speed;
};
