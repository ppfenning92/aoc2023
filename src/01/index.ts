export const one = async (data: string = EXAMPLE_ONE) => {
  const lines = data.split("\n").filter(Boolean);

  const numsInLines = lines
    .map((l) => l.replaceAll(/[\D]/g, ""))
    .map((digits) => `${digits.at(0)}${digits.at(-1)}`)
    .map((s) => parseInt(s, 10));

  // console.log(numsInLines);

  const sum = numsInLines.reduce((sum, x) => (sum += x), 0);

  console.log(sum);
};
export const two = async (data: string = EXAMPLE_TWO) => {
  const lines = data.split("\n").filter(Boolean);

  const numsInLines = lines
    // .slice(8, 9)
    .map((l) => {
      const parsed = parser(l);
      console.log(parsed, l, `${parsed.at(0)}${parsed.at(-1)}`);
      return parsed;
    })
    // .map((l) => l.replaceAll(/[\D]/g, ""));
    .map((digits) => `${digits.at(0)}${digits.at(-1)}`)
    .map((s) => parseInt(s, 10));

  // console.log(numsInLines);

  const sum = numsInLines.reduce((sum, x) => (sum += x), 0);

  console.log(sum);
};

const EXAMPLE_ONE = `
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
`;
const EXAMPLE_TWO = `
two1nine
eightwothree
abcone2threexyz
xtwone3four
4nineeightseven2
zoneight234
7pqrstsixteen
`;

const words = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

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
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
} as const;
