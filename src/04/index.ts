import { intersection, sumReducer, toInt } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '13';
const EX1_DAT = `
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11
`;

const parser = (input: string) => {
    const cards = input
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    return cards.map((card) => {
        const [_, text] = card.split(':');
        const [winning, numbers] = text.trim().split('|');
        return [
            winning
                .split(' ')
                .map((valStr) => valStr.trim())
                .filter(Boolean)
                .map(toInt),
            numbers
                .split(' ')
                .map((valStr) => valStr.trim())
                .filter(Boolean)
                .map(toInt),
        ];
    });
};

const one = async (data: string): Promise<Res> => {
    const cards = parser(data);

    const matches = cards.map(([winning, numbers]) => intersection(winning, numbers));

    const matchesCount = matches.map((matches) => matches.length);

    const points = matchesCount.map((pow) => Math.pow(2, pow - 1));

    return points.reduce(sumReducer, 0);
};

const EX2_RES = '30';
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const cards = parser(data);

    const matches = cards.map(([winning, numbers]) => intersection(winning, numbers));

    const matchesCount = matches.map((matches) => matches.length);

    const copiers = matchesCount.reduce(
        (map, count, idx) => {
            map[`${idx + 1}`] = count;
            return map;
        },
        {} as Record<string, number>
    );
    const scratches = Object.keys(copiers).reduce(
        (map, key) => {
            map[`${key}`] = 1;
            return map;
        },
        {} as Record<string, number>
    );

    Object.entries(copiers).forEach(([card, matches]) => {
        if (!copiers[card]) return;

        for (let i = +card + 1; i < +card + matches + 1; i++) {
            scratches[i] += scratches[card];
        }
    });

    return Object.values(scratches).reduce(sumReducer, 0);
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
