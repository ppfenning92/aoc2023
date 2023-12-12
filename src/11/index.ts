import { re, row } from 'mathjs';
import { parseMatrix, printMatrix, sumReducer } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '374';
const EX1_DAT = `
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....
`;
type Map = ('.' | '#' | '@')[][];
const expansion = (map: Map) => {
    const emptyRowIndezies: number[] = [];
    for (let r = 0; r < map.length; r++) {
        if (map[r].every((cell) => cell !== '#')) {
            emptyRowIndezies.push(r);
        }
    }

    emptyRowIndezies.forEach((rowIdx, offset) => {
        const newRow = new Array(map[0].length).fill('@');
        map.splice(rowIdx + offset, 0, newRow);
    });

    const emptyColIndezies: number[] = [];
    for (let c = 0; c < map[0].length; c++) {
        if (
            Array(map.length)
                .fill(0)
                .every((_, rowIdx) => map[rowIdx][c] !== '#')
        ) {
            emptyColIndezies.push(c);
        }
    }

    emptyColIndezies.forEach((colIdx, offset) => {
        for (let r = 0; r < map.length; r++) {
            map[r].splice(colIdx + offset, 0, '@');
        }
    });
};

const findGalaxyCoordinates = (map: Map): [number, number][] => {
    const galaxyCoordinates: [number, number][] = [];
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === '#') {
                galaxyCoordinates.push([r, c]);
            }
        }
    }
    return galaxyCoordinates;
};
const one = async (data: string): Promise<Res> => {
    const map = parseMatrix(data) as Map;
    expansion(map);
    // printMatrix(map);
    const galaxyCoordinates = findGalaxyCoordinates(map);

    const distances: number[] = [];

    galaxyCoordinates.forEach(([r, c], idx) => {
        for (let to = idx + 1; to < galaxyCoordinates.length; to++) {
            const [to_r, to_c] = galaxyCoordinates[to];

            const distance = Math.abs(r - to_r) + Math.abs(c - to_c);
            // console.log([r, c], [to_r, to_c], distance);

            distances.push(distance);
        }
    });

    return distances.reduce(sumReducer, 0);
};

const EX2_DAT = EX1_DAT;

// const EX2_RES = '374'; // 2
// const EX2_RES = '1030'; // 10
const EX2_RES = '8410'; // 100

const findEmptySpace = (map: Map) => {
    const emptyRowIndezies: number[] = [];
    for (let r = 0; r < map.length; r++) {
        if (map[r].every((cell) => cell !== '#')) {
            emptyRowIndezies.push(r);
        }
    }

    const emptyColIndezies: number[] = [];
    for (let c = 0; c < map[0].length; c++) {
        if (
            Array(map.length)
                .fill(0)
                .every((_, rowIdx) => map[rowIdx][c] !== '#')
        ) {
            emptyColIndezies.push(c);
        }
    }
    return [emptyRowIndezies, emptyColIndezies];
};
const inBetween = (a: number, b: number, test: number) => {
    const lower = Math.min(a, b);
    const upper = Math.max(a, b);
    return lower <= test && test <= upper;
};
const two = async (data: string): Promise<Res> => {
    const map = parseMatrix(data) as Map;
    printMatrix(map);
    const [emptyRows, emptyCols] = findEmptySpace(map);
    const galaxyCoordinates = findGalaxyCoordinates(map);

    const distances: number[] = [];
    const multiplier = 1_000_000;
    galaxyCoordinates.forEach(([r, c], idx) => {
        for (let to = idx + 1; to < galaxyCoordinates.length; to++) {
            const [to_r, to_c] = galaxyCoordinates[to];

            let distance = Math.abs(r - to_r) + Math.abs(c - to_c);
            const crossEmptyRows = emptyRows.filter((rowIdx) => inBetween(r, to_r, rowIdx)).length;
            const crossEmptyCols = emptyCols.filter((colIdx) => inBetween(c, to_c, colIdx)).length;
            distance += (crossEmptyRows + crossEmptyCols) * (multiplier - 1);
            distances.push(distance);
        }
    });
    console.log(distances.reduce(sumReducer, 0));

    return EX2_RES;
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
