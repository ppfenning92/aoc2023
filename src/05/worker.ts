import { parentPort, workerData } from 'worker_threads';
import { parser, ORDER } from '.';

(({ data, start, end, name }: { data: string; start: number; end: number; name: string }) => {
    const [, maps] = parser(data);
    let currentLocalLowestLocation = Number.MAX_SAFE_INTEGER;
    let mark = performance.now();

    for (let seed = start; seed <= start + end; seed++) {
        const iter = seed - start;
        const location = ORDER.reduce((currentKey, currentMap) => {
            const ranges = maps[currentMap];
            const useRange = ranges.find(
                ({ source, range }) => currentKey >= source && currentKey <= source + range
            );

            if (useRange) {
                return useRange.target + currentKey - useRange.source;
            }

            return currentKey;
        }, seed);

        if (iter % 200_000 === 0) {
            parentPort?.postMessage({
                prog: Math.round((iter / end) * 100),
                name,
                eta: ((end - iter) / 200_000) * ((performance.now() - mark) / 1000),
            });

            mark = performance.now();
        }
        if (location < currentLocalLowestLocation) {
            currentLocalLowestLocation = location;
        }
    }

    parentPort?.postMessage({ done: currentLocalLowestLocation, name });
})(workerData);
