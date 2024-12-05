import { parseMatrix, printMatrix } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '46';
const EX1_DAT = `
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....
`;

type Mirror = '/' | '\\';
//   ^?
type Splitter = '|' | '-';
type Empty = '.';

type Cavern = (Mirror | Splitter | Empty)[][];
const DIR = {
    UP: { dx: 0, dy: -1 },
    DOWN: { dx: 0, dy: 1 },
    LEFT: { dx: -1, dy: 0 },
    RIGHT: { dx: 1, dy: 0 },
} as const;

type CoordStr = `${number}-${number}`;
const follow = (
    map: Cavern,
    pos: { x: number; y: number },
    dir: keyof typeof DIR,
    energized: Map<CoordStr, Set<keyof typeof DIR>>
) => {
    //                                                     ^?
    if (
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x >= map[0].length ||
        pos.y >= map.length ||
        energized.get(`${pos.x}-${pos.y}`)?.has(dir)
    ) {
        return;
    }

    if (!energized.has(`${pos.x}-${pos.y}`)) {
        energized.set(`${pos.x}-${pos.y}`, new Set([dir]));
    } else {
        energized.get(`${pos.x}-${pos.y}`)?.add(dir);
    }

    const current = map[pos.y][pos.x];

    if (current === '.') {
        follow(map, { x: pos.x + DIR[dir].dx, y: pos.y + DIR[dir].dy }, dir, energized);
    }

    if (current === '/') {
        switch (dir) {
            case 'UP':
                follow(
                    map,
                    { x: pos.x + DIR['RIGHT'].dx, y: pos.y + DIR['RIGHT'].dy },
                    'RIGHT',
                    energized
                );
                break;
            case 'DOWN':
                follow(
                    map,
                    { x: pos.x + DIR['LEFT'].dx, y: pos.y + DIR['LEFT'].dy },
                    'LEFT',
                    energized
                );
                break;
            case 'LEFT':
                follow(
                    map,
                    { x: pos.x + DIR['DOWN'].dx, y: pos.y + DIR['DOWN'].dy },
                    'DOWN',
                    energized
                );
                break;
            case 'RIGHT':
                follow(map, { x: pos.x + DIR['UP'].dx, y: pos.y + DIR['UP'].dy }, 'UP', energized);
                break;
            default: {
                const _exhaustiveCheck: never = dir;
                throw new Error(`Unhandled direction: ${_exhaustiveCheck}`);
            }
        }
    }

    if (current === '\\') {
        switch (dir) {
            case 'UP':
                follow(
                    map,
                    { x: pos.x + DIR['LEFT'].dx, y: pos.y + DIR['LEFT'].dy },
                    'LEFT',
                    energized
                );
                break;
            case 'DOWN':
                follow(
                    map,
                    { x: pos.x + DIR['RIGHT'].dx, y: pos.y + DIR['RIGHT'].dy },
                    'RIGHT',
                    energized
                );
                break;
            case 'LEFT':
                follow(map, { x: pos.x + DIR['UP'].dx, y: pos.y + DIR['UP'].dy }, 'UP', energized);
                break;
            case 'RIGHT':
                follow(
                    map,
                    { x: pos.x + DIR['DOWN'].dx, y: pos.y + DIR['DOWN'].dy },
                    'DOWN',
                    energized
                );
                break;
            default: {
                const _exhaustiveCheck: never = dir;
                throw new Error(`Unhandled direction: ${_exhaustiveCheck}`);
            }
        }
    }

    if (current === '|') {
        switch (dir) {
            case 'UP':
            case 'DOWN':
                follow(map, { x: pos.x + DIR[dir].dx, y: pos.y + DIR[dir].dy }, dir, energized);
                break;
            case 'LEFT':
            case 'RIGHT':
                follow(map, { x: pos.x + DIR['UP'].dx, y: pos.y + DIR['UP'].dy }, 'UP', energized);
                follow(
                    map,
                    { x: pos.x + DIR['DOWN'].dx, y: pos.y + DIR['DOWN'].dy },
                    'DOWN',
                    energized
                );
                break;
            default: {
                const _exhaustiveCheck: never = dir;
                throw new Error(`Unhandled direction: ${_exhaustiveCheck}`);
            }
        }
    }

    if (current === '-') {
        switch (dir) {
            case 'UP':
            case 'DOWN':
                follow(
                    map,
                    { x: pos.x + DIR['LEFT'].dx, y: pos.y + DIR['LEFT'].dy },
                    'LEFT',
                    energized
                );
                follow(
                    map,
                    { x: pos.x + DIR['RIGHT'].dx, y: pos.y + DIR['RIGHT'].dy },
                    'RIGHT',
                    energized
                );
                break;
            case 'LEFT':
            case 'RIGHT':
                follow(map, { x: pos.x + DIR[dir].dx, y: pos.y + DIR[dir].dy }, dir, energized);
                break;
            default: {
                const _exhaustiveCheck: never = dir;
                throw new Error(`Unhandled direction: ${_exhaustiveCheck}`);
            }
        }
    }
    return;
    // throw new Error(`Unhandled tile: ${current}`);
};

const one = async (data: string): Promise<Res> => {
    const map: Cavern = parseMatrix(data) as Cavern;

    // printMatrix(map);
    const energized = new Map<CoordStr, Set<keyof typeof DIR>>();
    follow(map, { x: 0, y: 0 }, 'RIGHT', energized);
    // console.log(energized.size);

    return energized.size.toString();
};

const EX2_RES = 51;
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const map = parseMatrix(data) as Cavern;
    // part 1 for each edge tile
    //
    let currentBest = -Infinity;
    const energized = new Map<CoordStr, Set<keyof typeof DIR>>();
    for (let row = 0; row < map.length; row++) {
        // left edge
        energized.clear();
        follow(map, { x: 0, y: row }, 'RIGHT', energized);
        if (energized.size > currentBest) {
            currentBest = energized.size;
        }
        // right edge
        energized.clear();
        follow(map, { x: map[0].length - 1, y: row }, 'LEFT', energized);
        if (energized.size > currentBest) {
            currentBest = energized.size;
        }
    }

    for (let col = 0; col < map[0].length; col++) {
        // top edge
        energized.clear();
        follow(map, { x: col, y: 0 }, 'DOWN', energized);
        if (energized.size > currentBest) {
            currentBest = energized.size;
        }
        // bottom edge
        energized.clear();
        follow(map, { x: col, y: map.length - 1 }, 'UP', energized);

        if (energized.size > currentBest) {
            currentBest = energized.size;
        }
    }
    return currentBest.toString();
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
