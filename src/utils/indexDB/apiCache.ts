import { BaseDB, BaseDBSchema } from "./baseDB";

interface ApiCacheSchema extends BaseDBSchema {
	apiCache: {
		key: string;
		value: {
			data: any;
			timestamp: number;
			url: string;
			method: string;
			params?: any;
		};
		indexes: {
			"by-url": string;
			"by-timestamp": number;
		};
	};
}

export class ApiCache extends BaseDB<ApiCacheSchema> {
	private readonly CACHE_DURATION = 1000 * 60 * 60; // 1小时缓存时间

	constructor() {
		super({
			name: "agricultural-diagnostic-api-cache",
			version: 1,
			stores: [
				{
					name: "apiCache",
					indexes: [
						{ name: "by-url", keyPath: "url" },
						{ name: "by-timestamp", keyPath: "timestamp" }
					]
				}
			]
		});
	}

	private generateKey(url: string, method: string, params?: any): string {
		return `${method}:${url}:${JSON.stringify(params || {})}`;
	}

	async setCache(url: string, method: string, data: any, params?: any): Promise<void> {
		try {
			const key = this.generateKey(url, method, params);
			await this.put(
				"apiCache",
				{
					data,
					timestamp: Date.now(),
					url,
					method,
					params
				},
				key
			);
		} catch (error) {
			console.error("Failed to set cache:", error);
		}
	}

	async getCache(url: string, method: string, params?: any): Promise<any> {
		try {
			const key = this.generateKey(url, method, params);
			const result = await this.get("apiCache", key);

			if (!result) return null;

			// 检查缓存是否过期
			if (Date.now() - result.timestamp > this.CACHE_DURATION) {
				await this.delete("apiCache", key);
				return null;
			}

			return result.data;
		} catch (error) {
			console.error("Failed to get cache:", error);
			return null;
		}
	}

	async deleteCache(url: string, method: string, params?: any): Promise<void> {
		try {
			const key = this.generateKey(url, method, params);
			await this.delete("apiCache", key);
		} catch (error) {
			console.error("Failed to delete cache:", error);
		}
	}

	async clearCache(): Promise<void> {
		try {
			await this.clear("apiCache");
		} catch (error) {
			console.error("Failed to clear cache:", error);
		}
	}

	// 获取所有过期的缓存
	async getExpiredCache(): Promise<Array<{ key: string; value: any }>> {
		const expired: Array<{ key: string; value: any }> = [];
		await this.cursor("apiCache", async (value, key) => {
			if (Date.now() - value.timestamp > this.CACHE_DURATION) {
				expired.push({ key, value });
			}
		});
		return expired;
	}

	// 清理过期的缓存
	async cleanExpiredCache(): Promise<void> {
		const expired = await this.getExpiredCache();
		for (const { key } of expired) {
			await this.delete("apiCache", key);
		}
	}

	// 按URL获取缓存
	async getByUrl(url: string): Promise<any[]> {
		try {
			return await this.getByIndex("apiCache", "by-url", url);
		} catch (error) {
			console.error("Failed to get cache by URL:", error);
			return [];
		}
	}

	// 获取最近的缓存
	async getRecentCache(limit: number = 10): Promise<any[]> {
		try {
			const all = await this.getAll("apiCache");
			return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
		} catch (error) {
			console.error("Failed to get recent cache:", error);
			return [];
		}
	}
}

export const apiCache = new ApiCache();
