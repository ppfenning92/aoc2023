import { arraysAreEqual, parseMatrix, printMatrix, sumReducer } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = 405;
const EX1_DAT = `
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#
`;

const parser = (data: string) => {
    return data
        .trim()
        .split('\n\n')
        .map((pattern) => parseMatrix(pattern));
};

const findHorizontalMirror = (pattern: string[][]) => {
    const mirrors = [];
    for (let row = 0; row < pattern.length; row++) {
        let distance: number = 1;
        let upper = pattern[row - (distance - 1)];
        let lower = pattern[row + distance];

        while (arraysAreEqual(upper, lower)) {
            distance++;

            upper = pattern[row - (distance - 1)];
            lower = pattern[row + distance];

            if (lower === undefined || upper === undefined) {
                mirrors.push(row + 1);
            }
        }
    }

    return mirrors;
};
const findVerticalMirror = (pattern: string[][]) => {
    const mirrors = [];
    for (let col = 0; col < pattern[0].length; col++) {
        let distance: number = 1;
        let left = pattern.map((row) => row[col - (distance - 1)]);
        let right = pattern.map((row) => row[col + distance]);

        while (arraysAreEqual(left, right)) {
            distance++;

            left = pattern.map((row) => row[col - (distance - 1)]);
            right = pattern.map((row) => row[col + distance]);

            if (left[0] === undefined || right[0] === undefined) {
                mirrors.push(col + 1);
            }
        }
    }
    return mirrors;
};
const one = async (data: string): Promise<Res> => {
    const patterns = parser(data); //.slice(1);

    const summaries = patterns.map((pattern, idx) => {
        const horizontal = findHorizontalMirror(pattern)[0];
        const vertical = findVerticalMirror(pattern)[0];

        if (horizontal) return horizontal * 100;
        if (vertical) return vertical;

        printMatrix(pattern);
        throw idx;
    });
    const res = summaries.reduce(sumReducer, 0);
    if (res !== EX1_RES && (res <= 32759 || res >= 39211)) {
        console.log(res);

        return 'wrong';
    }
    return res;
};

const EX2_RES = '400';
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const patterns = parser(data); //.slice(98, 99);

    const summaries = patterns.map((pattern, idx) => {
        const originalHorizontal = findHorizontalMirror(pattern);
        const originalVertical = findVerticalMirror(pattern);
        // console.log({ originalVertical, originalHorizontal });

        for (let r = 0; r < pattern.length; r++) {
            for (let c = 0; c < pattern[r].length; c++) {
                pattern[r][c] = pattern[r][c] === '#' ? '.' : '#';

                const horizontal = findHorizontalMirror(pattern).find(
                    (h) => h !== originalHorizontal[0]
                );
                const vertical = findVerticalMirror(pattern).find((v) => v !== originalVertical[0]);

                pattern[r][c] = pattern[r][c] === '#' ? '.' : '#';

                // console.log(
                // `tested ${r}-${c}: vertical:${vertical ?? -1} | horizontal: ${horizontal ?? -1}`
                // );
                if (horizontal || vertical) {
                    // found at least one line

                    if (horizontal) {
                        return horizontal * 100;
                    }

                    if (vertical) {
                        return vertical;
                    }
                }
            }
        }

        console.log(idx, 'weird case');
        printMatrix(pattern);
        return originalVertical ?? originalHorizontal ?? 0;
    });
    const res = summaries.reduce(sumReducer, 0);
    console.log(`RESULT: ${res}`, summaries.filter(Boolean).length);

    // 46565 too high
    // 26786 too low
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
