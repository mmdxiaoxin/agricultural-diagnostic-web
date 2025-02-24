type RequestFn<T> = () => Promise<T>;

interface ConcurrencyQueueOptions {
	concurrency: number; // 最大并发数
	onProgress?: (completed: number, total: number) => void; // 可选的进度回调
}

/**
 * @description 并发队列
 * @param {Array} tasks 请求任务列表
 * @param {Object} options 配置项
 * @return Promise
 */
export const concurrencyQueue = async <T>(
	tasks: RequestFn<T>[],
	{ concurrency, onProgress }: ConcurrencyQueueOptions
): Promise<T[]> => {
	const results: T[] = [];
	let currentIndex = 0; // 当前请求的索引
	let completed = 0; // 已完成的请求数

	// 控制并发请求的队列
	const executeTask = async () => {
		while (currentIndex < tasks.length) {
			const taskIndex = currentIndex++;
			const task = tasks[taskIndex];

			try {
				// 执行请求
				const result = await task();
				results[taskIndex] = result;
			} catch (error) {
				// 处理错误（你可以根据需求调整错误处理方式）
				console.error(`任务 ${taskIndex} 执行失败`, error);
			}

			completed++;

			// 调用进度回调
			if (onProgress) {
				onProgress(completed, tasks.length);
			}
		}
	};

	// 执行并发请求队列，限制并发数
	const promises: Promise<void>[] = [];
	for (let i = 0; i < concurrency; i++) {
		promises.push(executeTask());
	}

	// 等待所有任务完成
	await Promise.all(promises);

	return results;
};
