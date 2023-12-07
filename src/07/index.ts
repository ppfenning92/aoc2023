import { prepare } from '../utils/fetch-challenge';
import { Res } from '../utils/types';
import { sumReducer } from '../utils';

const EX1_RES = '6440';
const EX1_DAT = `
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483
`;

type Card = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';
type Hand = [Card, Card, Card, Card, Card];
const CARD_ORDER: { [key in Card]: number } = {
    'A': 13,
    'K': 12,
    'Q': 11,
    'J': 10,
    'T': 9,
    '9': 8,
    '8': 7,
    '7': 6,
    '6': 5,
    '5': 4,
    '4': 3,
    '3': 2,
    '2': 1,
} as const;

const isFiveOfAKind = ([first, ...rest]: Hand): boolean => {
    return rest.every((c) => c === first);
};

const isFourOfAKind = (hand: Hand): boolean => {
    const [first, second, third, forth, fifth] = hand.toSorted();

    return first === forth || second === fifth;
};

const isFullHouse = (hand: Hand): boolean => {
    const [first, second, third, forth, fifth] = hand.toSorted();

    return (first === second && third === fifth) || (first === third && forth === fifth);
};

const isThreeOfAKind = (hand: Hand): boolean => {
    const [first, second, third, forth, fifth] = hand.toSorted();

    return first === third || second === forth || third === fifth;
};

const isTwoPair = (hand: Hand) => new Set(hand).size === 3;
const isOnePair = (hand: Hand) => new Set(hand).size === 4;

const getType = (hand: Hand) => {
    if (isFiveOfAKind(hand)) return 0;
    if (isFourOfAKind(hand)) return 1;
    if (isFullHouse(hand)) return 2;
    if (isThreeOfAKind(hand)) return 3;
    if (isTwoPair(hand)) return 4;
    if (isOnePair(hand)) return 5;
    return 6;
};
const isBetter = (first: Hand, second: Hand) => {
    const firstType = getType(first);
    const secondType = getType(second);

    if (firstType < secondType) return true;
    if (firstType > secondType) return false;

    for (let i = 0; i < first.length; i++) {
        if (CARD_ORDER[first[i]] < CARD_ORDER[second[i]]) return false;
        if (CARD_ORDER[first[i]] > CARD_ORDER[second[i]]) return true;
    }
};

const parser = (data: string): [Hand, number][] => {
    return data
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(' '))
        .map(([cards, bid]) => {
            return [cards.split('') as Hand, parseInt(bid, 10)];
        });
};

const one = async (data: string): Promise<Res> => {
    const hands = parser(data);
    // console.log(hands);

    const ranked = hands.toSorted(([a], [b]) => {
        // console.log({ a, b });

        if (isBetter(a, b)) return 1;
        return -1;
    });

    // console.log(ranked);

    return ranked.map(([_, bid], idx) => bid * (idx + 1)).reduce(sumReducer, 0);
};

const EX2_RES = '5905';
const EX2_DAT = EX1_DAT;
const CARD_ORDER_JOKER: { [key in Card]: number } = {
    'A': 13,
    'K': 12,
    'Q': 11,
    'J': 0,
    'T': 9,
    '9': 8,
    '8': 7,
    '7': 6,
    '6': 5,
    '5': 4,
    '4': 3,
    '3': 2,
    '2': 1,
} as const;
const getTypeJoker = (hand: Hand) => {
    const jokers = hand.filter((c) => c === 'J').length;
    if (jokers > 0) {
        if (isFiveOfAKind(hand)) {
            if (jokers === 5) return 0;
            throw 'aaaa';
        }
        if (isFourOfAKind(hand)) {
            if (jokers === 4) return 0; //will be 5 isFiveOfAKind
            if (jokers === 1) return 0;
            throw 'bbbb';
        }
        if (isFullHouse(hand)) {
            if (jokers === 2) return 0;
            if (jokers === 3) return 0;
            throw 'ccccc';
        }

        if (isThreeOfAKind(hand)) {
            if (jokers === 3) return 1; // isFourOfAKind
            if (jokers === 2) throw 'should not happend = fullHouse';
            if (jokers === 1) return 1;

            console.log({ jokers, hand });
            throw 'dddd';
        }

        if (isTwoPair(hand)) {
            if (jokers === 2) return 1; // isFourOfAKind
            if (jokers === 1) return 2; // isFullHouse250054801

            console.log({ jokers, hand });
            throw 'jjj';
        }

        if (isOnePair(hand)) {
            if (jokers === 1) return 3;
            if (jokers === 2) return 3;

            console.log({ jokers, hand });
            throw 'hhh';
        }

        if (jokers !== 1) {
            console.log({ hand, jokers });

            throw 'xxxx';
        }
        return 5;
    } else {
        if (isFiveOfAKind(hand)) return 0;
        if (isFourOfAKind(hand)) return 1;
        if (isFullHouse(hand)) return 2;
        if (isThreeOfAKind(hand)) return 3;
        if (isTwoPair(hand)) return 4;
        if (isOnePair(hand)) return 5;
        return 6;
    }
};

const isBetterJoker = (first: Hand, second: Hand) => {
    const firstType = getTypeJoker(first);
    const secondType = getTypeJoker(second);

    if (firstType < secondType) return true;
    if (firstType > secondType) return false;

    for (let i = 0; i < first.length; i++) {
        if (CARD_ORDER_JOKER[first[i]] < CARD_ORDER_JOKER[second[i]]) return false;
        if (CARD_ORDER_JOKER[first[i]] > CARD_ORDER_JOKER[second[i]]) return true;
    }
};
const two = async (data: string): Promise<Res> => {
    const hands = parser(data);
    const ranked = hands.toSorted(([a], [b]) => {
        if (isBetterJoker(a, b)) return 1;
        if (isBetterJoker(b, a)) return -1;
        return 0;
    });

    return ranked.map(([, bid], idx) => bid * (idx + 1)).reduce(sumReducer, 0);
};
// 250_957_765 to high
// 250_054_801 to high
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
