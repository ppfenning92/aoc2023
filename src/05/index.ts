import { toInt } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { Worker } from 'node:worker_threads';

import { MultiBar, Presets, SingleBar } from 'cli-progress';
const EX1_RES = 35;
const EX1_DAT = `
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4
` as const;

// humidity-to-location map:
// 1384411009 3878276792 140553103
// 3206048776 3137400006 12882465
// 2370337851 2414914902 179202838
// 23738616 0 161914533
// 0 262282387 23738616
// 840681798 3768356904 109919888
// 2340008493 3054171079 26130417
// 1524964112 840681798 815044381
// 3130048499 2668879895 76000277
// 185653149 548908967 81490523
// 3465042209 3687267183 62255927
// 367511526 286021003 262887964
// 3005762489 2744880172 124286010
// 1025363841 2357768227 57146675
// 2549540689 1901546427 456221800
// 3218931241 4018829895 240309425
// 1101344310 2869166182 185004897
// 1286349207 1655726179 98061802
// 2366138910 1753787981 4198941
// 3459240666 4259139320 5801543
// 950601686 2594117740 74762155
// 3584396646 1757986922 143559505
// 267143672 161914533 100367854
// 3527298136 3080301496 57098510
// 1082510516 3749523110 18833794
// 3727956151 3150282471 536984712
// ` as const;

// const parser = (data: string): [string[], Record<string, Record<string, string>>] => {
//     const [seedString, ...mapStrings] = data.trim().split('\n\n');
//
//     const seeds = seedString.trim().split(':').at(-1)?.trim().split(' ') ?? [];
//     //      ^?
//     const maps = mapStrings
//         //  ^?
//         .map((str) => str.split(':\n'))
//         .reduce(
//             (map, [name, valuesString]) => {
//                 const key = name.split(' ').at(0) ?? '';
//                 const values = valuesString.split('\n').reduce(
//                     (valueMap, ranges) => {
//                         const [target, source, range] = ranges.split(' ').map(toInt);
//                         for (let r = 0; r < range; r++) {
//                             valueMap[source + r] = target + r;
//                         }
//
//                         return valueMap;
//                     },
//
//                     Array(100)
//                         .fill(0)
//                         .reduce((map, _, idx) => {
//                             map[idx] = idx;
//                             return map;
//                         }, {})
//                 );
//                 map[key] = values;
//                 return map;
//             },
//             {} as Record<string, Record<string, string>>
//         );
//     return [seeds, maps];
// };

export const parser = (
    data: string
): [number[], Record<string, Array<{ target: number; source: number; range: number }>>] => {
    const [seedString, ...mapStrings] = data.trim().split('\n\n');

    const seeds = seedString.trim().split(':').at(-1)?.trim().split(' ') ?? [];
    //      ^?
    const maps = mapStrings
        //  ^?
        .map((str) => str.split(':\n'))
        .reduce(
            (map, [name, valuesString]) => {
                const key = name.split(' ').at(0) ?? '';
                // console.log({ valuesString });

                map[key] = valuesString.split('\n').map((tar_src_ran) => {
                    const [target, source, range] = tar_src_ran.split(' ').map(toInt);
                    return { target, source, range };
                });
                return map;
            },
            {} as Record<string, { target: number; source: number; range: number }[]>
        );
    return [seeds.map(toInt), maps];
};

export const ORDER = [
    'seed-to-soil',
    'soil-to-fertilizer',
    'fertilizer-to-water',
    'water-to-light',
    'light-to-temperature',
    'temperature-to-humidity',
    'humidity-to-location',
];
const one = async (data: string): Promise<Res> => {
    const [seeds, maps] = parser(data);
    //             ^?
    // console.log(maps);

    const locations = seeds.map((seed) => {
        return ORDER.reduce((currentKey, currentMap) => {
            const ranges = maps[currentMap];
            //       ^?

            // return ranges.reduce((_seed, rangeObj) => {
            //     if (_seed >= rangeObj.source && _seed <= rangeObj.source + rangeObj.range) {
            //         return rangeObj.target + (_seed - rangeObj.source);
            //     }
            //     return _seed;
            // }, +currentKey);
            //
            const useRange = ranges.find(
                ({ source, range }) => currentKey >= source && currentKey <= source + range
            );

            if (useRange) {
                return useRange.target + currentKey - useRange.source;
            }

            return currentKey;
        }, seed);
    });
    // console.log(locations);

    return Math.min(...locations);
};

const EX2_RES = '46';
const EX2_DAT = EX1_DAT;

const two_ = async (data: string): Promise<Res> => {
    const [seedRanges, maps] = parser(data);

    let currentLowestLocation = Number.MAX_SAFE_INTEGER;
    let total = 0;
    let _start = performance.now();
    for (let i = 0; i < seedRanges.length; i += 2) {
        const [start, end] = seedRanges.slice(i, i + 2);

        for (let seed = start; seed <= start + end; seed++) {
            if (total % 1000_000 === 0) {
                console.log(total, (performance.now() - _start) / 1_000);
                _start = performance.now();
            }

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

            if (location < currentLowestLocation) {
                currentLowestLocation = location;
                console.log({ currentLowestLocation });
            }
            total += 1;
        }
    }

    return currentLowestLocation;
};

const two = async (data: string): Promise<Res> => {
    const [seedRanges] = parser(data);
    const threads = new Set<Worker>();
    const responses: number[] = [];
    const progress = new MultiBar(
        {
            clearOnComplete: false,
            hideCursor: true,
            format: ' {bar} | {i} | {value}/{total}  || ETA: {eta_my}s',
        },
        Presets.shades_grey
    );
    const progressBars: Record<string, SingleBar> = {};
    const res: number[] = await new Promise((resolve) => {
        for (let i = 0; i < seedRanges.length; i += 2) {
            const [start, end] = seedRanges.slice(i, i + 2);
            progressBars[i] = progress.create(100, 0, { i });

            const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
                workerData: { data, start, end, name: i },
            });

            threads.add(worker);
        }

        for (const worker of threads) {
            worker.on('error', (err) => {
                throw err;
            });
            worker.on('exit', () => {
                threads.delete(worker);
                if (threads.size === 0) {
                    resolve(responses);
                }
            });
            worker.on(
                'message',
                (
                    msg:
                        | { prog: number; name: string | number; eta: number }
                        | { done: number; name: string }
                ) => {
                    if ('prog' in msg) {
                        progressBars[msg.name].update(msg.prog, { eta_my: msg.eta.toFixed() });
                    }
                    if ('done' in msg) {
                        responses.push(msg.done);
                        progressBars[msg.name].update(100, { eta: 'now' });
                    }
                }
            );
        }
    });

    progress.stop();
    console.log('\n\n');

    return Math.min(...res);
};

export const run = async (day: string) => {
    const data = await prepare(day);

    if (!EX1_RES || !EX1_DAT) {
        console.error('Part 1 not ready yet');
        return;
    }

    const EX1_SOL = await one(EX1_DAT);
    if (EX1_SOL != EX1_RES) {
        const msg = `Part 1 failed!\nExpected: ${EX1_RES} - Received: ${EX1_SOL}`;

        console.error(msg);
        return;
    }

    console.log('PART 1:', await one(data));

    if (!EX2_RES || !EX2_DAT) {
        console.error('Part 2 not ready yet');
        return;
    }
    const EX2_SOL = await two(EX2_DAT);

    if (EX2_SOL != EX2_RES) {
        const msg = `Part 2 failed!\nExpected: ${EX2_RES} - Received: ${EX2_SOL}`;
        console.error(msg);
        return;
    }

    console.log('PART 2:', await two(data));

    console.log(`DONE: 🎉`);

    process.exit(0);
};

//  23_738_616  23738616
