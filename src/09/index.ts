import { sumReducer, toInt, trim } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = '114';
const EX1_DAT = `
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45
`;
const parser = (data: string) => {
    //  ^?
    return data
        .split('\n')
        .map(trim)
        .filter(Boolean)
        .map((s) => s.split(' ').map(toInt));
};
const one = async (data: string): Promise<Res> => {
    const sequences = parser(data);

    const calculated = sequences.map((seq) => {
        //                                 ^?
        const calculatedSequences: [number[], ...number[][]] = [seq];
        //            ^?
        while (calculatedSequences.at(-1)?.some(Boolean)) {
            const lastSequence = calculatedSequences.at(-1);

            if (!lastSequence) {
                throw "can't happen";
            }

            const nextSeq = [];

            for (let i = 0; i < lastSequence.length - 1; i++) {
                nextSeq.push(lastSequence[i + 1]! - lastSequence[i]);
            }

            calculatedSequences.push(nextSeq);
        }

        return calculatedSequences;
    });

    const extrapolations = calculated.map((seqs) => {
        const lasts: number[] = seqs.map((a) => a.at(-1) ?? 0);
        return lasts.reduce(sumReducer, 0);
    });
    return extrapolations.reduce(sumReducer, 0);
};

const EX2_RES = '2';
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const sequences = parser(data);

    const calculated = sequences.map((seq) => {
        //                                 ^?
        const calculatedSequences: [number[], ...number[][]] = [seq];
        //            ^?
        while (calculatedSequences.at(-1)?.some(Boolean)) {
            const lastSequence = calculatedSequences.at(-1);

            if (!lastSequence) {
                throw "can't happen";
            }

            const nextSeq = [];

            for (let i = 0; i < lastSequence.length - 1; i++) {
                nextSeq.push(lastSequence[i + 1]! - lastSequence[i]);
            }

            calculatedSequences.push(nextSeq);
        }

        return calculatedSequences;
    });

    const extrapolations = calculated.map((seqs) => {
        return seqs
            .reverse()
            .map((s) => s.at(0) ?? 0)
            .reduce((previousNewFirst, currentFirst) => {
                return currentFirst - previousNewFirst;
            }, 0);
    });

    return extrapolations.reduce(sumReducer, 0);
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
