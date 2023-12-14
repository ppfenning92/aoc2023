import { parseMatrix, sumReducer } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '136';

const EX1_DAT = `
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....
`;
type Plattform = ('.' | 'O' | '#')[][];

const parser = (data: string): Plattform => {
    return parseMatrix(data.trim()) as Plattform;
};

const one = async (data: string): Promise<Res> => {
    const plattform = parser(data);

    tiltNorth(plattform);

    const res = plattform.map((row, rowIdx) => {
        return row.filter((e) => e === 'O').length * Math.abs(rowIdx - plattform.length);
    });
    return res.reduce(sumReducer, 0);
};

const tiltSouth = (plattform: Plattform) => {
    for (let c = 0; c < plattform[0].length; c++) {
        for (let r = 0; r < plattform.length; r++) {
            for (let s = 0; s < plattform.length - r - 1; s++) {
                if (plattform[s + 1][c] === '.' && plattform[s][c] === 'O') {
                    plattform[s + 1][c] = 'O';
                    plattform[s][c] = '.';
                }
            }
        }
    }
};

const tiltEast = (plattfrom: Plattform) => {
    for (let r = 0; r < plattfrom.length; r++) {
        for (let c = 0; c < plattfrom[r].length; c++) {
            for (let s = 0; s < plattfrom[r].length - c - 1; s++) {
                if (plattfrom[r][s] === 'O' && plattfrom[r][s + 1] === '.') {
                    plattfrom[r][s] = '.';
                    plattfrom[r][s + 1] = 'O';
                }
            }
        }
    }
};

const tiltWest = (plattfrom: Plattform) => {
    for (let r = 0; r < plattfrom.length; r++) {
        for (let c = 0; c < plattfrom[r].length; c++) {
            for (let s = 0; s < plattfrom[r].length - c - 1; s++) {
                if (plattfrom[r][s] === '.' && plattfrom[r][s + 1] === 'O') {
                    plattfrom[r][s] = 'O';
                    plattfrom[r][s + 1] = '.';
                }
            }
        }
    }
};
const tiltNorth = (plattform: Plattform) => {
    for (let c = 0; c < plattform[0].length; c++) {
        for (let r = 0; r < plattform.length; r++) {
            for (let s = 0; s < plattform.length - r - 1; s++) {
                if (plattform[s][c] === '.' && plattform[s + 1][c] === 'O') {
                    plattform[s][c] = 'O';
                    plattform[s + 1][c] = '.';
                }
            }
        }
    }
};

const EX2_RES = '64';
const EX2_DAT = EX1_DAT;
const CYCLES = 1_000_000_000;
const two = async (data: string): Promise<Res> => {
    const plattform = parser(data);

    const seen = new Map();
    let rest = 0;
    for (let index = 0; index < CYCLES; index++) {
        tiltNorth(plattform);
        tiltWest(plattform);
        tiltSouth(plattform);
        tiltEast(plattform);
        //
        const str = plattform.reduce((rows, row) => {
            return `${rows},${row.reduce((line, char) => `${line}${char}`, '')}`;
        }, '');

        if (seen.has(str)) {
            rest = (CYCLES - seen.get(str) - 1) % (index - seen.get(str));
            console.log('CYCLE DETECTED ', seen.get(str));

            break;
        } else {
            seen.set(str, index);
        }
    }

    for (let i = 0; i < rest; i++) {
        tiltNorth(plattform);
        tiltWest(plattform);
        tiltSouth(plattform);
        tiltEast(plattform);
    }

    // 101033 //too high
    const res = plattform.map((row, rowIdx) => {
        return row.filter((e) => e === 'O').length * Math.abs(rowIdx - plattform.length);
    });

    return res.reduce(sumReducer, 0);
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
    console.log('Test for Part2 passed');

    console.log('PART 2:', await two(data));

    console.log(`DONE: 🎉`);

    process.exit(0);
};
