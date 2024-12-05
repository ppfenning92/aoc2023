import { sumReducer, toInt } from '../utils';
import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';

const EX1_RES = 21;
const EX1_DAT = `
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1
`;
type Info = ('.' | '?' | '#')[];
type Groups = number[];
function trimDots(str: string): string {
    return str.replace(/^\.*|\.*$/g, '');
}
const parser = (data: string): [Info, Groups][] => {
    return data
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(' '))
        .map(([infoStr, groupStr]) => {
            const info: Info = trimDots(infoStr).split('') as Info;
            const groups = groupStr.split(',').map(toInt) as Groups;
            return [info, groups];
        });
};

const permuteQuestionMarks = (info: Info, d: number, permutations: Info[]) => {
    if (d > info.length) {
        permutations.push(info);
        // console.log(d, permutations);

        return permutations;
    }
    const next = d + 1;
    if (info.at(d) === '?') {
        const head = info.slice(0, d);
        const tail = info.slice(d + 1);
        const caseHash = [...head, '#', ...tail] as Info;
        const caseDot = [...head, '.', ...tail] as Info;

        // probalby test if cases are still valid

        permuteQuestionMarks(caseHash, next, permutations);
        permuteQuestionMarks(caseDot, next, permutations);
    } else {
        permuteQuestionMarks(info, next, permutations);
    }
    return permutations;
};
function arraysAreEqual<T = unknown>(arr1: T[], arr2: T[]) {
    // Check if the arrays are the same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Check each element in the arrays
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    // If all checks pass, the arrays are the same
    return true;
}
const one = async (data: string): Promise<Res> => {
    const records = parser(data);

    const validArrangements = records.map(([info, group], idx) => {
        const permutations = permuteQuestionMarks(info, 0, []);

        return permutations
            .map((infoRecord) => {
                const possibleRecord = infoRecord.join('').split('.').filter(Boolean);
                //     ^?
                // console.log(possibleRecord);

                const possibleGroups = possibleRecord.map((springs) => springs.length);
                //     ^?
                // if (idx === 2) {
                //     console.log(possibleRecord, possibleGroups);
                // }
                return possibleGroups;
            })
            .filter((recordGroupLength) => arraysAreEqual(recordGroupLength, group)).length;
    });

    const res = validArrangements.reduce(sumReducer, 0);

    if (res >= 8002) {
        console.log({ res });

        return -1;
    }
    return res;
};

const EX2_RES = '525152';
const EX2_DAT = EX1_DAT;

const findValidWithDFS = (info: Info) => {
    const count = 0;

    const [start, ...rest] = info;

    if (start === '?') {
        findValidWithDFS();
    }
};
const two = async (data: string): Promise<Res> => {
    const records = parser(data);

    const validArrangements = records.map(([info, group]) => {
        const foldedInfo = Array(5).fill(info.join('')).join('?').split('') as Info;
        //      ^?
        const foldedGroup = Array(5).fill(group.join('')).join(',').split(',').map(toInt) as Groups;
        const permutations = permuteQuestionMarks(foldedInfo, 0, []);

        return permutations
            .map((infoRecord) => {
                const possibleRecord = infoRecord.join('').split('.').filter(Boolean);
                const possibleGroups = possibleRecord.map((springs) => springs.length);
                return possibleGroups;
            })
            .filter((recordGroupLength) => arraysAreEqual(recordGroupLength, foldedGroup)).length;
    });

    const res = validArrangements.reduce(sumReducer, 0);

    return res;
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
