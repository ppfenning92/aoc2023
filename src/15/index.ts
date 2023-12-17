import { sum } from 'mathjs';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = 1320;
const EX1_DAT = `rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`;

const hash = (char: string, startingValue = 0) => {
    // increment by ascii of char
    startingValue += char.charCodeAt(0);
    // multiply by 17
    startingValue *= 17;
    return startingValue % 256;
};

const one = async (data: string): Promise<Res> => {
    if ('HASH'.split('').reduce((v, char) => hash(char, v), 0) !== 52) {
        throw 'hash function broke';
    }

    const steps = data.trim().split(',');

    const hashed = steps.map((step) => {
        return step.split('').reduce((v, char) => hash(char, v), 0);
    });

    return sum(hashed);
};

const EX2_RES = 145;
const EX2_DAT = EX1_DAT;

const two = async (data: string): Promise<Res> => {
    const steps = data.trim().split(',');
    const boxes = new Map<number, { label: string; lens: number }[]>();

    steps.forEach((step) => {
        const [label, lens]: [string, string] = step.split(/[-=]/) as [string, string];
        const op: '-' | '=' = lens ? '=' : '-';

        const boxId = label.split('').reduce((v, char) => hash(char, v), 0);

        const box = boxes.get(boxId) ?? [];

        const lensPos = box.findIndex(({ label: l }) => l === label);
        if (op === '-') {
            if (lensPos >= 0) {
                box.splice(lensPos, 1);
            }
        }

        if (op === '=') {
            if (lensPos < 0) {
                box.push({ label, lens: parseInt(lens, 10) });
            } else {
                box.splice(lensPos, 1, { label, lens: parseInt(lens, 10) });
            }
        }

        if (box.length) {
            boxes.set(boxId, box);
        } else {
            boxes.delete(boxId);
        }
        // console.log(`After "${step}":`);
        // boxes.forEach((lenses, boxId) => {
        //     console.log(
        //         `Box ${boxId}: ${lenses.reduce(
        //             (str, lens) => `${str} [${lens.label} ${lens.lens ?? ''}]`,
        //             ''
        //         )}`
        //     );
        // });
    });

    const powers = [...boxes.entries()].map(([boxId, lenses]) => {
        return lenses.reduce(
            (_power, { lens }, slot) => (_power += (boxId + 1) * (slot + 1) * lens),
            0
        );
    });

    return sum(powers);
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
