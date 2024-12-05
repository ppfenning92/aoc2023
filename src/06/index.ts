import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { toInt } from '../utils';

const EX1_RES = '288';
const EX1_DAT = `
Time:      7  15   30
Distance:  9  40  200
`;

const parser = (input: string) => {
    const [tStr, dStr] = input.trim().split('\n');
    const times =
        tStr
            .trim()
            .split(':')
            .at(-1)
            ?.split(' ')
            .map((s) => s.trim())
            .filter(Boolean)
            .map(toInt) ?? [];
    const distances =
        dStr
            .trim()
            .split(':')
            .at(-1)
            ?.split(' ')
            .map((s) => s.trim())
            .filter(Boolean)
            .map(toInt) ?? [];
    const races: { t: number; d: number }[] = [];
    for (let i = 0; i < times.length; i++) {
        races.push({
            t: times[i],
            d: distances[i],
        });
    }
    return races;
};
const one = async (data: string): Promise<Res> => {
    const races = parser(data);

    // console.log(races);

    const winningStrats = races.map(({ t, d }) => {
        const good: number[] = [];
        // i is Velocity
        for (let i = 0; i <= t; i++) {
            const dt = i * (t - i);
            // console.log({ dt, t, i });

            if (dt > d) {
                good.push(i);
            }
        }
        return good;
    });

    const record = winningStrats.map((w) => w.length).reduce((mul, c) => (mul *= c), 1);
    return record;
};

const EX2_RES = '71503';
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const [t, d] = data
        .split('\n')
        .map((s) => s.replaceAll(/\D/g, ''))
        .filter(Boolean)
        .map(toInt);
    console.log({ t, d });

    /**
     * -v² + tv - d
     */

    const x1 = (-t + Math.sqrt(t ** 2 - 4 * -1 * -d)) / (2 * -1);
    const x2 = (-t - Math.sqrt(t ** 2 - 4 * -1 * -d)) / (2 * -1);

    console.log({ x1, x2 });

    return Math.floor(x2) - Math.ceil(x1) + 1;
    //
    //
    // let total = 0;
    // for (let v = t; v <= t; v++) {
    //     const dt = v * (t - v);
    //     if (dt > d) total++;
    // }
    //
    // return total;
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
