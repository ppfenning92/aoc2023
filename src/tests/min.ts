import { parentPort, workerData } from 'worker_threads';

(({ data, name }: { data: number[]; name: string }) => {
    console.warn('Starting worker', name, `\t\t@perf ${Date.now()}`);

    let min = Number.MAX_SAFE_INTEGER;

    for (const n of data) {
        if (n < min) {
            min = n;
        }
    }

    parentPort?.postMessage(min);
})(workerData);
