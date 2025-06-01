export interface BaseDBSchema {
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

export class BaseDB<T extends BaseDBSchema> {
	private db: IDBDatabase | null = null;
	private config: DBConfig;

	constructor(config: DBConfig) {
		this.config = config;
	}

	async init(): Promise<void> {
		if (this.db) return;

		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.config.name, this.config.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = event => {
				const db = request.result;
				const oldVersion = event.oldVersion;
				const newVersion = event.newVersion;

				if (oldVersion < (newVersion ?? 0)) {
					this.config.stores.forEach(store => {
						if (!db.objectStoreNames.contains(store.name)) {
							const objectStore = db.createObjectStore(store.name, { keyPath: "key" });
							store.indexes?.forEach(index => {
								objectStore.createIndex(index.name, index.keyPath);
							});
						}
					});
				}
			};
		});
	}

	async put<K extends keyof T>(storeName: K, value: T[K]["value"], key: string): Promise<void> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readwrite");
			const store = transaction.objectStore(storeName as string);
			const request = store.put({ key, value });

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async get<K extends keyof T>(storeName: K, key: string): Promise<T[K]["value"] | undefined> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readonly");
			const store = transaction.objectStore(storeName as string);
			const request = store.get(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result?.value);
		});
	}

	async delete<K extends keyof T>(storeName: K, key: string): Promise<void> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readwrite");
			const store = transaction.objectStore(storeName as string);
			const request = store.delete(key);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async clear<K extends keyof T>(storeName: K): Promise<void> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readwrite");
			const store = transaction.objectStore(storeName as string);
			const request = store.clear();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getAll<K extends keyof T>(storeName: K): Promise<T[K]["value"][]> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readonly");
			const store = transaction.objectStore(storeName as string);
			const request = store.getAll();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result.map(item => item.value));
		});
	}

	async getByIndex<K extends keyof T>(
		storeName: K,
		indexName: keyof T[K]["indexes"],
		value: T[K]["indexes"][keyof T[K]["indexes"]]
	): Promise<T[K]["value"][]> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readonly");
			const store = transaction.objectStore(storeName as string);
			const index = store.index(indexName as string);
			const request = index.getAll(value as IDBValidKey);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result.map(item => item.value));
		});
	}

	async cursor<K extends keyof T>(
		storeName: K,
		callback: (value: T[K]["value"], key: string) => Promise<void> | void
	): Promise<void> {
		await this.init();
		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(storeName as string, "readonly");
			const store = transaction.objectStore(storeName as string);
			const request = store.openCursor();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				const cursor = request.result;
				if (cursor) {
					Promise.resolve(callback(cursor.value.value, cursor.value.key))
						.then(() => cursor.continue())
						.catch(reject);
				} else {
					resolve();
				}
			};
		});
	}
}
