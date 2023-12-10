import { i, re } from 'mathjs';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { parseMatrix, printMatrix, toInt } from '../utils';

const EX1_RES = '8';
const EX1_DAT = `
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ
`;

const DIRS = {
    NORTH: { r: -1, c: 0 } as const,
    EAST: { r: 0, c: 1 } as const,
    SOUTH: { r: 1, c: 0 } as const,
    WEST: { r: 0, c: -1 } as const,
} as const;

const PIPES = {
    '|': [DIRS.NORTH, DIRS.SOUTH],
    '-': [DIRS.EAST, DIRS.WEST],
    'L': [DIRS.NORTH, DIRS.EAST],
    'J': [DIRS.NORTH, DIRS.WEST],
    '7': [DIRS.SOUTH, DIRS.WEST],
    'F': [DIRS.SOUTH, DIRS.EAST],
    '.': [],
    ' ': ' ',
} as const;

const replacer = (c: keyof typeof PIPES) => {
    return (
        {
            'F': '┏',
            '|': '┃',
            '-': '━',
            'L': '┗',
            'J': '┛',
            '7': '┓',
            '.': '▨',
            ' ': ' ',
        }[c] ?? c
    );
};
const findStart = (map: string[][]): [number, number] => {
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === 'S') {
                return [r, c];
            }
        }
    }
    return [-1, -1];
};

const walk = (
    map: (keyof typeof PIPES)[][],
    [r, c]: [number, number],
    loop: Set<`${number}-${number}`>
) => {
    const nodeKey: `${number}-${number}` = `${r}-${c}`;
    if (loop.has(nodeKey)) {
        return loop;
    }
    loop.add(nodeKey);
    // console.log(map[r][c], r, c);

    const connecting = PIPES[map[r][c]];
    //          ^?
    for (const dir of connecting) {
        const [r_new, c_new] = [r + dir.r, c + dir.c];
        if (
            r_new < 0 ||
            r_new >= map.length ||
            c_new < 0 ||
            c_new >= map[0].length ||
            map[r_new][c_new] === '.'
        ) {
            continue;
        }

        walk(map, [r_new, c_new], loop);
    }
    return loop;
};
const one = async (data: string): Promise<Res> => {
    const map = parseMatrix(data) as (keyof typeof PIPES)[][];
    // printMatrix(map, replacer);

    const startingNode = findStart(map);
    map[startingNode[0]][startingNode[1]] = 'F';
    const loop = walk(map, startingNode, new Set());
    // console.log({ loop });

    return loop.size / 2;
};

const EX2_S = 'F';
const EX2_RES = '4';
const EX2_DAT = `
..........
.S------7.
.|F----7|.
.||OOOO||.
.||OOOO||.
.|L-7F-J|.
.|II||II|.
.L--JL--J.
..........
`;

// const EX2_S = '7';
// const EX2_RES = '10';
// const EX2_DAT = `
// FF7FSF7F7F7F7F7F---7
// L|LJ||||||||||||F--J
// FL-7LJLJ||||||LJL-77
// F--JF--7||LJLJ7F7FJ-
// L---JF-JLJ.||-FJLJJ7
// |F|F-JF---7F7-L7L|7|
// |FFJF7L7F-JF7|JL---7
// 7-L-JL7||F7|L7F-7F7|
// L.L7LFJ|||||FJL7||LJ
// L7JLJL-JLJLJL--JLJ.L`;
//
// const EX2_S = 'F';
// const EX2_RES = '8';
// const EX2_DAT = `
// .F----7F7F7F7F-7....
// .|F--7||||||||FJ....
// .||.FJ||||||||L7....
// FJL7L7LJLJ||LJ.L-7..
// L--J.L7...LJS7F-7L7.
// ....F-J..F7FJ|L7L7L7
// ....L7.F7||L7|.L7L7|
// .....|FJLJ|FJ|F7|.LJ
// ....FJL-7.||.||||...
// ....L---J.LJ.LJLJ...`;
// Flood fill algorithm implemented recursively
function fillMatrix1(matrix, row, col) {
    if (!validCoordinates(matrix, row, col)) return;

    if (matrix[row][col] !== '.') return;

    matrix[row][col] = ' ';

    fillMatrix1(matrix, row + 1, col);
    fillMatrix1(matrix, row - 1, col);
    fillMatrix1(matrix, row, col + 1);
    fillMatrix1(matrix, row, col - 1);
}

function validCoordinates(matrix, row, col) {
    return row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length;
}
function addRowsAndColumns(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Add rows
    for (let i = 0; i < numRows; i++) {
        const newRow = new Array(numCols).fill('.');
        matrix.splice(1 + i * 2, 0, newRow);
    }

    // Add columns
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < numCols; j++) {
            matrix[i].splice(1 + j * 2, 0, '.');
        }
    }
}
function removeUnevenRowsAndColumns(matrix) {
    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Remove uneven rows
    for (let i = numRows - 1; i >= 0; i--) {
        if (i % 2 !== 0) {
            matrix.splice(i, 1);
        }
    }

    // Remove uneven columns
    for (let i = numCols - 1; i >= 0; i--) {
        if (i % 2 !== 0) {
            for (let j = 0; j < matrix.length; j++) {
                matrix[j].splice(i, 1);
            }
        }
    }
}
const two = async (data: string): Promise<Res> => {
    const map = parseMatrix(data) as (keyof typeof PIPES)[][];
    // printMatrix(map, replacer);

    const startingNode = findStart(map);
    map[startingNode[0]][startingNode[1]] = EX2_S;
    const loop = walk(map, startingNode, new Set());

    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (loop.has(`${r}-${c}`)) continue;
            map[r][c] = '.';
            // nodesToConsider.add(`${r}-${c}`);
        }
    }
    addRowsAndColumns(map);
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if ('F7|'.includes(map[r - 1]?.[c]) && 'JL|'.includes(map[r + 1]?.[c])) {
                map[r][c] = '|';
            }
            if ('FL-'.includes(map[r][c - 1]) && 'J7-'.includes(map[r][c + 1])) {
                map[r][c] = '-';
            }
        }
    }
    printMatrix(map);
    //
    for (let r = 0; r < map.length; r++) {
        fillMatrix1(map, r, 0);
        fillMatrix1(map, r, map[0].length - 1);
    }
    for (let c = 0; c < map[0].length; c++) {
        fillMatrix1(map, 0, c);
        fillMatrix1(map, map.length - 1, c);
    }
    // for (let r = 0; r < map.length; r++) {
    //     for (let c = 0; c < map[r].length; c++) {
    //         if (map[r][c] === ' ') {
    //             nodesToConsider.delete(`${r}-${c}`);
    //         }
    //     }
    // }
    printMatrix(map, replacer);

    removeUnevenRowsAndColumns(map);
    // printMatrix(map);

    // [...nodesToConsider].forEach((rc) => {
    //     const [r, c] = rc.split('-').map(toInt);
    //     let fromNorth = 0;
    //     for (let y = 0; y <= r; y++) {
    //         if (['F', '-', '|', '7', 'J', 'L'].includes(map[y][c])) {
    //             fromNorth++;
    //         }
    //     }
    //     let fromSouth = 0;
    //     for (let y = map.length - 1; y >= r; y--) {
    //         if (['F', '-', '|', '7', 'J', 'L'].includes(map[y][c])) {
    //             fromSouth++;
    //         }
    //     }
    //     let fromWest = 0;
    //     for (let x = 0; x <= c; x++) {
    //         if (['|', '-', 'F', '7', 'J', 'L'].includes(map[r][x])) {
    //             fromWest++;
    //         }
    //     }
    //     let fromEast = 0;
    //
    //     for (let x = map[0].length - 1; x >= c; x--) {
    //         if (['|', '-', 'F', '7', 'J', 'L'].includes(map[r][x])) {
    //             fromEast++;
    //         }
    //     }
    //
    //     const pipesCrossedFromDir = [fromNorth, fromSouth, fromWest, fromEast].filter(
    //         (x) => !(x & 1)
    //     ).length;
    //     // console.log({ rc, fromNorth, fromSouth, fromWest, fromEast, pipesCrossedFromDir });
    //
    //     if (pipesCrossedFromDir) {
    //         map[r][c] = ' ';
    //         nodesToConsider.delete(`${r}-${c}`);
    //     }
    // });
    //
    // 297 TO LOW
    // 316 to LOW
    // 476 wrong
    // 471 wrong
    // 610 max
    printMatrix(map, replacer);

    let dots = 0;
    for (let r = 0; r < map.length; r++) {
        for (let c = 0; c < map[r].length; c++) {
            if (map[r][c] === '.') {
                dots++;
            }
        }
    }

    console.log(dots);

    return dots;
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
