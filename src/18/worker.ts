import { isMainThread } from 'bun';
import { workerData, parentPort } from 'worker_threads';
import { CompactTrench, isPointOnLineSegment } from '.';

const countValid = ({
    upperRow,
    lowerRow,
    minCol,
    maxCol,
    trenchPointString,
    name,
}: {
    upperRow: number;
    lowerRow: number;
    minCol: number;
    maxCol: number;
    trenchPointString: string;
    name: string;
}) => {
    const trench = JSON.parse(trenchPointString) as CompactTrench;
    let localTotalArea = 0;
    let mark = performance.now();
    const totalRows = upperRow - lowerRow;
    for (let row = lowerRow; row <= upperRow; row++) {
        let inside = false;
        const iter = row - lowerRow;
        for (let col = minCol; col <= maxCol; col++) {
            const crossing = isPointOnLineSegment(trench, { row, col });
            if (crossing) {
                inside = !inside;
            }
            if (inside) {
                localTotalArea++;
            }
        }
        if (iter % 500 === 0) {
            // console.log({ iter, upperRow, name });
            parentPort?.postMessage({
                prog: Math.round((iter / totalRows) * 100),
                name,
                eta: ((totalRows - iter) / 500) * ((performance.now() - mark) / 1000),
            });

            mark = performance.now();
        }
    }

    parentPort?.postMessage({ done: localTotalArea, name });
};

if (isMainThread) {
    throw new Error('This file should not be run in the main thread');
}
countValid(workerData);
