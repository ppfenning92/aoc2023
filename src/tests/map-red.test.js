"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var map_reduce_1 = require("../utils/map-reduce");
var randomArrays = Array(4)
    .fill(0)
    .map(function () {
    return Array(100000000)
        .fill(0)
        .map(function () { return Math.floor(Math.random() * 100000000); });
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
var startWorkkers = performance.now();
var res = await (0, map_reduce_1.mapReduce)(new URL('./min.ts', import.meta.url).href, randomArrays);
console.log('worker', res, ' - took:', performance.now() - startWorkkers);
