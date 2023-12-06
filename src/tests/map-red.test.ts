import { mapReduce } from '../utils/map-reduce';

const randomArrays = Array(4)
    .fill(0)
    .map(() => {
        return Array(100_000_000)
            .fill(0)
            .map(() => Math.floor(Math.random() * 100_000_000));
    });

// const startNormal = performance.now();
//
// const normalMins: number[] = [];
//
// for (const list of randomArrays) {
//     let localMin = Number.MAX_SAFE_INTEGER;
//     for (const n of list) {
//         if (n < localMin) {
//             localMin = n;
//         }
//     }
//     normalMins.push(localMin);
// }
//
// console.log('normal', normalMins, '- took:', performance.now() - startNormal);

const startWorkkers = performance.now();

const res = await mapReduce(new URL('./min.ts', import.meta.url).href, randomArrays);
console.log('worker', res, ' - took:', performance.now() - startWorkkers);
