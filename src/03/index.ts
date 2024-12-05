import { getAdjacentCoords, parseMatrix, sumReducer } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = 4361;
const EX1_DAT = `
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..
`;

const parser = (m: string[][]) => {
    return m.map((row) =>
        row.map((cell) => {
            if (cell === '.') {
                return '';
            }

            if (cell.match(/\d+/)) {
                return parseInt(cell, 10);
            }

            return cell;
        })
    );
};

const findNeighboringDigitsAndSetNull = (row: any[], colIdx: number): number[] => {
    const neighboringNumbers = [parseInt(row[colIdx], 10)];
    // Check if the index is valid
    row[colIdx] = '';

    // Check left neighbors
    for (let i = colIdx - 1; i >= 0 && typeof row[i] === 'number'; i--) {
        neighboringNumbers.unshift(row[i]);
        row[i] = '';
    }

    // Check right neighbors
    for (let i = colIdx + 1; i < row.length && typeof row[i] === 'number'; i++) {
        neighboringNumbers.push(row[i]);
        row[i] = '';
    }

    return neighboringNumbers;
};
const one = async (data: string): Promise<Res> => {
    const schema = parser(parseMatrix(data));
    // printMatrix(schema);

    const nums: number[] = [];

    schema.forEach((row, rowIdx) => {
        row.forEach((col, colIdx) => {
            if (!col || typeof col !== 'string') {
                return;
            }

            const adjacentCoords = getAdjacentCoords(
                rowIdx,
                colIdx,
                schema.length,
                row.length,
                true
            );

            Object.entries(adjacentCoords).forEach(([loc, [r, c]]) => {
                if (typeof schema[r][c] === 'number') {
                    const num = findNeighboringDigitsAndSetNull(schema[r], c);
                    nums.push(parseInt(num.join(''), 10));
                }
            });

            // console.log(col, adjacentCoords);
        });
    });

    // printMatrix(schema);
    return nums.reduce(sumReducer, 0);
};

const EX2_RES = 467835;
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const schema = parser(parseMatrix(data));
    const possibleGears: [number, number][] = [];
    schema.forEach((row, ri) => {
        row.forEach((cell, ci) => {
            if (cell === '*') {
                possibleGears.push([ri, ci]);
            }
        });
    });

    const partNumsPerGear = possibleGears
        .map(([r, c]) => {
            const adjacentCoords = getAdjacentCoords(r, c, schema.length, schema[r].length, true);
            const adjacentNums = Object.entries(adjacentCoords)
                .map(([loc, [r, c]]) => {
                    if (typeof schema[r][c] === 'number') {
                        const num = findNeighboringDigitsAndSetNull(schema[r], c);
                        return parseInt(num.join(''), 10);
                    }
                })
                .filter(Boolean);
            return adjacentNums;
        })
        .filter((nums) => nums.length === 2)
        .filter(Boolean);

    return partNumsPerGear
        .map((list) => list.reduce((mul, n) => (mul *= n), 1))
        .reduce(sumReducer, 0);
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
