import {
	openDB,
	DBSchema,
	IDBPDatabase,
	StoreNames,
	StoreValue,
	StoreKey,
	IndexNames,
	IndexKey
} from "idb";

export interface BaseDBSchema extends DBSchema {
	[key: string]: {
		key: string;
		value: any;
		indexes?: {
			[key: string]: IDBValidKey;
		};
	};
}

export interface DBConfig {
	name: string;
	version: number;
	stores: Array<{
		name: string;
		keyPath?: string;
		autoIncrement?: boolean;
		indexes?: Array<{
			name: string;
			keyPath: string;
		}>;
	}>;
}

interface StoreItem {
	key: string;
	value: any;
}

export class BaseDB<T extends BaseDBSchema> {
	private db: IDBPDatabase<T> | null = null;
	private config: DBConfig;

	constructor(config: DBConfig) {
		this.config = config;
	}

	async init(): Promise<void> {
		if (this.db) return;

		this.db = await openDB<T>(this.config.name, this.config.version, {
			upgrade: (db, oldVersion, newVersion) => {
				if (oldVersion < (newVersion ?? 0)) {
					this.config.stores.forEach(store => {
						if (!db.objectStoreNames.contains(store.name as StoreNames<T>)) {
							const objectStore = db.createObjectStore(store.name as StoreNames<T>, {
								keyPath: "key"
							});
							store.indexes?.forEach(index => {
								objectStore.createIndex(
									index.name as IndexNames<T, StoreNames<T>>,
									`value.${index.keyPath}`
								);
							});
						}
					});
				}
			}
		});
	}

	async put<K extends StoreNames<T>>(storeName: K, value: any, key: string): Promise<void> {
		await this.init();
		await this.db!.put(storeName, { key, value } as StoreValue<T, K>);
	}

	async get<K extends StoreNames<T>>(storeName: K, key: StoreKey<T, K>): Promise<any | undefined> {
		await this.init();
		const result = (await this.db!.get(storeName, key)) as StoreItem | undefined;
		return result?.value;
	}

	async delete<K extends StoreNames<T>>(storeName: K, key: StoreKey<T, K>): Promise<void> {
		await this.init();
		await this.db!.delete(storeName, key);
	}

	async clear<K extends StoreNames<T>>(storeName: K): Promise<void> {
		await this.init();
		await this.db!.clear(storeName);
	}

	async getAll<K extends StoreNames<T>>(storeName: K): Promise<any[]> {
		await this.init();
		const results = (await this.db!.getAll(storeName)) as StoreItem[];
		return results.map(item => item.value);
	}

	async getByIndex<K extends StoreNames<T>>(
		storeName: K,
		indexName: IndexNames<T, K>,
		value: IndexKey<T, K, IndexNames<T, K>>
	): Promise<any[]> {
		await this.init();
		const results = (await this.db!.getAllFromIndex(storeName, indexName, value)) as StoreItem[];
		return results.map(item => item.value);
	}

	async cursor<K extends StoreNames<T>>(
		storeName: K,
		callback: (value: any, key: string) => Promise<void> | void
	): Promise<void> {
		await this.init();
		const tx = this.db!.transaction(storeName, "readonly");
		const store = tx.objectStore(storeName);
		let cursor = await store.openCursor();

		while (cursor) {
			const item = cursor.value as StoreItem;
			await callback(item.value, item.key);
			cursor = await cursor.continue();
		}
	}
}
