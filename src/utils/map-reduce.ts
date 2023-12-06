import { Worker } from 'node:worker_threads';

export function mapReduce(path: string, data: unknown[]) {
    const threads = new Set<Worker>();

    let responses: unknown[] = [];

    return new Promise((resolve) => {
        data.forEach((d, idx) => {
            console.log('Adding worker ', idx, `\t\t@perf ${Date.now()}`);
            const worker = new Worker(path, { workerData: { data: d, name: idx } });

            threads.add(worker);
            console.log('Added worker ', worker.threadId, idx, `\t\t@perf ${Date.now()}`);
        });

        for (const worker of threads) {
            worker.on('error', (err) => {
                throw err;
            });
            worker.on('exit', () => {
                threads.delete(worker);
                // console.log(`Thread exiting, ${threads.size} running...`);
                if (threads.size === 0) {
                    resolve(responses);
                }
            });
            worker.on('message', (msg) => {
                responses = responses.concat(msg);
            });
        }
    });
}
