import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { Stack } from 'typescript-collections';
import { MultiBar, Presets, SingleBar } from 'cli-progress';
import { Worker } from 'node:worker_threads';
import os from 'os';
import { sum } from 'mathjs';
import Polygon from 'polygon';

const EX1_RES = '62';
const EX1_DAT = `
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)
`;
type DIR = 'U' | 'D' | 'L' | 'R';
type HexColor = `#${string}`;

const isHexColor = (color: string): color is HexColor => {
    return /^#[0-9a-f]{6}$/i.test(color);
};
const isDir = (dir: string): dir is DIR => {
    return ['U', 'D', 'L', 'R'].includes(dir);
};

type Instruction = {
    dir: DIR;
    steps: number;
    color: HexColor;
};

const parse = (data: string): Instruction[] => {
    return data
        .trim()
        .split('\n')
        .map((line): Instruction => {
            const [dir, stepsStr, colorStr] = line.split(' ');
            const steps = parseInt(stepsStr, 10);
            const color = colorStr.replace(/[^0-9a-f#]/gi, '');
            if (!isHexColor(color)) {
                throw new Error(`Invalid color: ${color}`);
            }
            if (!isDir(dir)) {
                throw new Error(`Invalid direction: ${dir}`);
            }

            return { dir, steps, color };
        });
};

// const getSiteSize = (plan: Instruction[]) => {
//     const width =
//         plan
//             .filter(({ dir }) => dir === 'L' || dir === 'R')
//             .reduce(
//                 (acc, { dir, steps }) => {
//                     acc.currentDistance =
//                         dir === 'L' ? acc.currentDistance - steps : acc.currentDistance + steps;
//                     acc.maxDistance = Math.max(acc.maxDistance, Math.abs(acc.currentDistance));
//                     return acc;
//                 },
//                 { maxDistance: 0, currentDistance: 0 }
//             ).maxDistance + 1;
//     const height =
//         plan
//             .filter(({ dir }) => dir === 'U' || dir === 'D')
//             .reduce(
//                 (acc, { dir, steps }) => {
//                     acc.currentDistance =
//                         dir === 'U' ? acc.currentDistance - steps : acc.currentDistance + steps;
//                     acc.maxDistance = Math.max(acc.maxDistance, Math.abs(acc.currentDistance));
//                     return acc;
//                 },
//                 { maxDistance: 0, currentDistance: 0 }
//             ).maxDistance + 1;
//
//     return { width, height };
// };

const expandSite = (site: Site, where: 'top' | 'bottom' | 'left' | 'right'): void => {
    switch (where) {
        case 'top':
            site.unshift(new Array(site[0].length).fill('.'));
            break;

        case 'bottom':
            site.push(new Array(site[0].length).fill('.'));
            break;

        case 'left':
            site.forEach((row) => row.unshift('.'));
            break;
        case 'right':
            site.forEach((row) => row.push('.'));
            break;
        default: {
            const exauhstiveCheck: never = where;
            const msg = `Unhandled case: ${exauhstiveCheck}`;
            throw new Error(msg);
        }
    }
};

const checkPos = (site: Site, pos: { row: number; col: number }): void => {
    if (pos.row < 0) {
        expandSite(site, 'top');
        pos.row = 0;
    }
    if (pos.row >= site.length) {
        expandSite(site, 'bottom');
    }
    if (pos.col < 0) {
        expandSite(site, 'left');
        pos.col = 0;
    }
    if (pos.col >= site[0].length) {
        expandSite(site, 'right');
    }
};
const digTrench = (site: Site, plan: Instruction[]): void => {
    const pos = { row: Math.ceil(site.length / 2), col: Math.ceil(site[0].length / 2) };

    plan.forEach(({ dir, steps }) => {
        if (dir === 'U') {
            for (let i = 0; i < steps; i++) {
                pos.row--;
                checkPos(site, pos);
                site[pos.row][pos.col] = '#';
            }
        }
        if (dir === 'D') {
            for (let i = 0; i < steps; i++) {
                pos.row++;
                checkPos(site, pos);
                site[pos.row][pos.col] = '#';
            }
        }
        if (dir === 'L') {
            for (let i = 0; i < steps; i++) {
                pos.col--;
                checkPos(site, pos);
                site[pos.row][pos.col] = '#';
            }
        }
        if (dir === 'R') {
            for (let i = 0; i < steps; i++) {
                pos.col++;
                checkPos(site, pos);
                site[pos.row][pos.col] = '#';
            }
        }
    });
};

type Site = ('.' | '#')[][];
// site has a closed border of '#'
// flood fill inside staring from 1,1
//
const findStart = (site: Site): { row: number; col: number } => {
    for (let row = 1; row < site.length; row++) {
        for (let col = 0; col < site[0].length; col++) {
            if (
                site[row][col] === '.' &&
                site[row - 1][col] === '#' &&
                site[row][col - 1] === '#'
            ) {
                return { row, col };
            }
        }
    }
    throw new Error('No start found');
};
const digInside = (site: Site): void => {
    const { row, col } = findStart(site);
    // console.log({ row, col });
    floodFill(site, row, col);
};
// iterative floodfill
const floodFill = (site: Site, row: number, col: number): void => {
    const stack = new Stack<{ row: number; col: number }>();
    stack.push({ row, col });
    while (!stack.isEmpty()) {
        const { row, col } = stack.pop() as { row: number; col: number };
        if (site[row][col] !== '.') continue;
        site[row][col] = '#';
        stack.push({ row: row - 1, col });
        stack.push({ row: row + 1, col });
        stack.push({ row, col: col - 1 });
        stack.push({ row, col: col + 1 });
    }
};

const countHash = (site: Site): number => {
    return site.reduce((acc, row) => {
        return (
            acc +
            row.reduce((acc, cell) => {
                return acc + (cell === '#' ? 1 : 0);
            }, 0)
        );
    }, 0);
};

// shrink site by removing empty rows and columns
const shrinkSite = (site: Site): void => {
    for (let row = 0; row < site.length; row++) {
        if (site[row].every((cell) => cell === '.')) {
            site.splice(row, 1);
            row--;
        }
    }

    for (let col = 0; col < site[0].length; col++) {
        if (site.every((row) => row[col] === '.')) {
            site.forEach((row) => row.splice(col, 1));
            col--;
        }
    }
};
const one = async (data: string): Promise<Res> => {
    const plan = parse(data);
    //       ^?

    const site: Site = [[]];
    digTrench(site, plan);

    digInside(site);

    return countHash(site).toString();
};

const EX2_RES = 952_408_144_115;
const EX2_DAT = EX1_DAT;

// list of points
export type CompactTrench = { row: number; col: number }[];

const EncodedDirections = {
    '0': 'R',
    '1': 'D',
    '2': 'L',
    '3': 'U',
};

const measurePerimeter = (compactTrench: CompactTrench): number => {
    let perimeter = 0;
    // loop in pairs
    for (let i = 0; i < compactTrench.length; i++) {
        const p1 = compactTrench[i];
        const p2 = compactTrench[(i + 1) % compactTrench.length];
        perimeter += Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);
    }
    return perimeter;
};

const getBoundingBox = (
    compactTrench: CompactTrench
): { min: { row: number; col: number }; max: { row: number; col: number } } => {
    const min = { row: Infinity, col: Infinity };
    const max = { row: -Infinity, col: -Infinity };
    for (const { row, col } of compactTrench) {
        min.row = Math.min(min.row, row);
        min.col = Math.min(min.col, col);
        max.row = Math.max(max.row, row);
        max.col = Math.max(max.col, col);
    }
    return { min, max };
};
const two = async (data: string): Promise<Res> => {
    const oldPlan = parse(data);

    const plan = oldPlan.map(({ color }): Instruction => {
        const [hash, ...hexColor] = color;

        const encodedDirection = hexColor.at(-1);

        const encodedDistance = hexColor.slice(0, 5).join('');
        const distance = parseInt(encodedDistance, 16);
        const direction = EncodedDirections[encodedDirection];
        if (!direction) throw new Error(`Invalid direction: ${encodedDirection}, ${hexColor}`);

        return { dir: direction, steps: distance, color: `#${hash}` };
    });

    const trench: CompactTrench = plan.reduce((acc, { dir, steps }) => {
        const last = acc[acc.length - 1];
        if (!last) {
            acc.push({ row: 0, col: 0 });
            return acc;
        }
        switch (dir) {
            case 'U':
                acc.push({ row: last.row - steps, col: last.col });
                break;
            case 'D':
                acc.push({ row: last.row + steps, col: last.col });
                break;
            case 'L':
                acc.push({ row: last.row, col: last.col - steps });
                break;
            case 'R':
                acc.push({ row: last.row, col: last.col + steps });
                break;
            default: {
                const exauhstiveCheck: never = dir;
                const msg = `Unhandled case: ${exauhstiveCheck}`;
                throw new Error(msg);
            }
        }
        return acc;
    }, [] as CompactTrench);

    const polygon = new Polygon(trench.map(({ row, col }) => [row, col]));

    return polygon.area() + measurePerimeter(trench) / 2 + 1;

    // // const perimeter: number = measurePerimeter(trench);
    // // console.log({ perimeter });
    // const { min, max } = getBoundingBox(trench);
    //
    // // loop in chunks over rows
    // // start cpu - 2 workers
    //
    // const responses: number[] = [];
    // const progress = new MultiBar(
    //     {
    //         clearOnComplete: false,
    //         hideCursor: true,
    //         format: ' {bar} | \t{i} | {value}/{total}  || ETA: {eta_my}s',
    //     }
    //     Presets.shades_classic
    // );
    //
    // const numActiveWorkers = os.cpus().length - 4;
    //
    // const threads = new Set<Worker>();
    // const progressBars: Record<string, SingleBar> = {};
    // const trenchString = JSON.stringify(trench);
    // const chunkSize = Math.ceil((max.row - min.row) / numActiveWorkers);
    // console.log({ chunkSize, numActiveWorkers });
    // const localTotals: number[] = await new Promise((resolve) => {
    //     for (let i = 0; i < numActiveWorkers; i++) {
    //         const start = i * chunkSize;
    //         const end = Math.min(i * chunkSize + chunkSize, max.row);
    //         progressBars[i] = progress.create(100, 0, { i });
    //
    //         const worker = new Worker(new URL('./worker.ts', import.meta.url).href, {
    //             workerData: {
    //                 lowerRow: start,
    //                 upperRow: end,
    //                 minCol: min.col,
    //                 maxCol: max.col,
    //                 trenchPointString: trenchString,
    //                 name: i,
    //             },
    //         });
    //
    //         threads.add(worker);
    //     }
    //
    //     for (const worker of threads) {
    //         worker.on('error', (err) => {
    //             throw err;
    //         });
    //         worker.on('exit', () => {
    //             threads.delete(worker);
    //             if (threads.size === 0) {
    //                 resolve(responses);
    //             }
    //         });
    //         worker.on(
    //             'message',
    //             (
    //                 msg:
    //                     | { prog: number; name: string | number; eta: number }
    //                     | { done: number; name: string }
    //             ) => {
    //                 if ('prog' in msg) {
    //                     progressBars[msg.name].update(msg.prog, { eta_my: msg.eta.toFixed() });
    //                 }
    //                 if ('done' in msg) {
    //                     responses.push(msg.done);
    //                     progressBars[msg.name].update(100, { eta: 'now' });
    //                 }
    //             }
    //         );
    //     }
    // });
    //
    // return sum(localTotals).toString();
};

export const isPointOnLineSegment = (
    compactTrench: CompactTrench,
    point: { row: number; col: number }
): boolean => {
    let isOnLine = false;
    for (let i = 0; i < compactTrench.length; i++) {
        const p1 = compactTrench[i];
        const p2 = compactTrench[(i + 1) % compactTrench.length];
        if (p1.row === p2.row && p1.row === point.row) {
            if (point.col >= Math.min(p1.col, p2.col) && point.col <= Math.max(p1.col, p2.col)) {
                isOnLine = true;
            }
        }
        if (p1.col === p2.col && p1.col === point.col) {
            if (point.row >= Math.min(p1.row, p2.row) && point.row <= Math.max(p1.row, p2.row)) {
                isOnLine = true;
            }
        }
    }
    return isOnLine;
};
export const run = async (day: string) => {
    const data = await prepare(day);

    const numFormat = Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
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
        const msg = `Part 2 failed!\nExpected: ${numFormat.format(
            EX2_RES
        )} - Received: ${numFormat.format(EX2_SOL)}`;
        console.log(`Off by ${numFormat.format(EX2_RES - EX2_SOL)}`);
        console.error(msg);
        return;
    }

    console.log('PART 2:', await two(data));

    console.log(`DONE: 🎉`);

    process.exit(0);
};
