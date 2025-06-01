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
			const timestamp = Date.now();
			await this.put(
				"apiCache",
				{
					data,
					timestamp,
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
		try {
			const expiredTimestamp = Date.now() - this.CACHE_DURATION;
			// 使用 by-timestamp 索引获取所有过期的缓存
			const expired = await this.getByIndex("apiCache", "by-timestamp", expiredTimestamp);
			return expired.map(item => ({
				key: this.generateKey(item.url, item.method, item.params),
				value: item
			}));
		} catch (error) {
			console.error("Failed to get expired cache:", error);
			return [];
		}
	}

	// 清理过期的缓存
	async cleanExpiredCache(): Promise<void> {
		try {
			const expiredTimestamp = Date.now() - this.CACHE_DURATION;
			// 使用 by-timestamp 索引直接删除过期的缓存
			const expired = await this.getByIndex("apiCache", "by-timestamp", expiredTimestamp);

			// 使用事务批量删除
			for (const item of expired) {
				await this.delete("apiCache", this.generateKey(item.url, item.method, item.params));
			}
		} catch (error) {
			console.error("Failed to clean expired cache:", error);
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
			// 使用 by-timestamp 索引获取最近的缓存
			const all = await this.getByIndex("apiCache", "by-timestamp", 0);
			// 由于索引是按时间戳升序排列的，我们需要反转数组并限制数量
			return all.reverse().slice(0, limit);
		} catch (error) {
			console.error("Failed to get recent cache:", error);
			return [];
		}
	}
}

export const apiCache = new ApiCache();
