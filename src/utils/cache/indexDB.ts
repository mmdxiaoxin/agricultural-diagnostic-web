import { openDB, DBSchema, IDBPDatabase } from "idb";

interface ApiCacheSchema extends DBSchema {
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

class ApiCache {
	private db: IDBPDatabase<ApiCacheSchema> | null = null;
	private readonly DB_NAME = "apiCache";
	private readonly STORE_NAME = "apiCache";
	private readonly CACHE_DURATION = 1000 * 60 * 60; // 1小时缓存时间

	async init() {
		if (!this.db) {
			const storeName = this.STORE_NAME;
			this.db = await openDB<ApiCacheSchema>(this.DB_NAME, 1, {
				upgrade(db) {
					const store = db.createObjectStore(storeName, { keyPath: "key" });
					store.createIndex("by-url", "url");
					store.createIndex("by-timestamp", "timestamp");
				}
			});
		}
		return this.db;
	}

	private generateKey(url: string, method: string, params?: any): string {
		return `${method}:${url}:${JSON.stringify(params || {})}`;
	}

	async set(url: string, method: string, data: any, params?: any) {
		const db = await this.init();
		const key = this.generateKey(url, method, params);
		await db.put(
			this.STORE_NAME,
			{
				data,
				timestamp: Date.now(),
				url,
				method,
				params
			},
			key
		);
	}

	async get(url: string, method: string, params?: any) {
		const db = await this.init();
		const key = this.generateKey(url, method, params);
		const result = await db.get(this.STORE_NAME, key);

		if (!result) return null;

		// 检查缓存是否过期
		if (Date.now() - result.timestamp > this.CACHE_DURATION) {
			await this.delete(url, method, params);
			return null;
		}

		return result.data;
	}

	async delete(url: string, method: string, params?: any) {
		const db = await this.init();
		const key = this.generateKey(url, method, params);
		await db.delete(this.STORE_NAME, key);
	}

	async clear() {
		const db = await this.init();
		await db.clear(this.STORE_NAME);
	}
}

export const apiCache = new ApiCache();
