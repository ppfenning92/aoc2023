import { sumReducer, toInt } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const one = async (data: string): Promise<Res> => {
    const lines = data.split('\n').filter(Boolean);

    const numsInLines = lines
        .map((l) => l.replaceAll(/[\D]/g, ''))
        .map((digits) => `${digits.at(0)}${digits.at(-1)}`)
        .map(toInt);

    const sum = numsInLines.reduce(sumReducer, 0);

    return sum;
};
const two = async (data: string): Promise<Res> => {
    const lines = data.split('\n').filter(Boolean);

    const numsInLines = lines
        // .slice(8, 9)
        .map((l) => {
            const parsed = parser(l);
            // console.log(parsed, l, `${parsed.at(0)}${parsed.at(-1)}`);
            return parsed;
        })
        // .map((l) => l.replaceAll(/[\D]/g, ""));
        .map((digits) => `${digits.at(0)}${digits.at(-1)}`)
        .map((s) => parseInt(s, 10));

    // console.log(numsInLines);

    const sum = numsInLines.reduce((sum, x) => (sum += x), 0);

    return sum;
};

const EX1_DAT = `
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
`;
const EX1_RES = '142';
const EX2_RES = '281';
const EX2_DAT = `
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen
`;

const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'] as const;

const parser = (s: string, parsed: string[] = []): string[] => {
    const match = words.find((w) => s.startsWith(w));

    if (s.length === 0 || !s) {
        return parsed;
    }
    if (match) {
        return parser(s.slice(1), [...parsed, parseMap[match]]);
    }

    if (s.match(/^\d/)) {
        return parser(s.slice(1), [...parsed, s.at(0) as string]);
    }

    return parser(s.slice(1), parsed);
};
const parseMap = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
} as const;

export const run = async (day: string) => {
    const data = await prepare(day);
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
