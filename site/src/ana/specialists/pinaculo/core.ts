export type PinaculoResults = {
  A: number;
  B: number;
  C: number;
  D: number;
  H: number;
  X: number;
  Y: number;
  E: number;
  F: number;
  G: number;
  I: number;
  J: number;
  Z: number;
  K: number;
  L: number;
  M: number;
  N: number;
  O: number;
  P: number;
  Q: number;
  R: number;
  S: number;
  W: number | number[];
  T: number | number[];
};

const MASTER_NUMBERS = new Set([11, 22, 33]);

/** Port of `PinaculoCalculator` from uset82/pinaculo `src/types/pinaculo.ts`. UI is not included. */
export const reduceNumber = (value: number): number => {
  let num = value;
  if (MASTER_NUMBERS.has(num)) return num;
  while (num > 9) {
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    num = sum;
    if (MASTER_NUMBERS.has(num)) return num;
  }
  return num;
};

export const convertMasterForNegatives = (num: number): number => {
  if (num === 11) return 2;
  if (num === 22) return 4;
  if (num === 33) return 6;
  return num;
};

export const calculateZ = (year: number): number => reduceNumber(year % 100);

export const calculateAbsentNumbers = (results: PinaculoResults): number[] => {
  const allNumbers = [
    results.A,
    results.B,
    results.C,
    results.D,
    results.E,
    results.F,
    results.G,
    results.H,
    results.I,
    results.J,
    results.K,
    results.L,
    results.M,
    results.N,
    results.O,
    results.P,
    results.Q,
    results.R,
    results.S,
  ];
  const occurrences = new Array(10).fill(0);
  allNumbers.forEach((num) => {
    if (num >= 0 && num <= 9) {
      occurrences[num] += 1;
    }
  });
  const absent: number[] = [];
  for (let index = 1; index <= 9; index += 1) {
    if (occurrences[index] === 0) absent.push(index);
  }
  return absent;
};

export const calculateTriplicidad = (results: PinaculoResults): number | number[] => {
  const negativeNumbers = [
    results.K,
    results.L,
    results.M,
    results.N,
    results.O,
    results.P,
    results.Q,
    results.R,
    results.S,
  ];
  const occurrences = new Array(10).fill(0);
  negativeNumbers.forEach((num) => {
    if (Number.isInteger(num) && num >= 0 && num <= 9) {
      occurrences[num] += 1;
    }
  });

  const wValues = new Set<number>();
  for (let digit = 1; digit <= 9; digit += 1) {
    if (occurrences[digit] === 3) {
      const w = reduceNumber(digit + digit + digit);
      if (w === 3 || w === 6 || w === 9) wValues.add(w);
    }
  }
  for (const w of [...wValues]) {
    if (occurrences[w] === 2) {
      const derived = reduceNumber(w + w + w);
      if (derived === 3 || derived === 6 || derived === 9) wValues.add(derived);
    }
  }
  if (wValues.size === 0) return 0;
  if (wValues.size === 1) return [...wValues][0] ?? 0;
  return [...wValues].sort((left, right) => left - right);
};

export const parseBirthDate = (birthDate: string): { day: number; month: number; year: number } => {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!iso) {
    throw new Error("birthDate must be YYYY-MM-DD");
  }
  const year = Number(iso[1]);
  const month = Number(iso[2]);
  const day = Number(iso[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("birthDate is not a valid calendar date");
  }
  return { day, month, year };
};

export const calculateComplete = (day: number, month: number, year: number): PinaculoResults => {
  const results = {} as PinaculoResults;
  results.A = reduceNumber(month);
  results.B = reduceNumber(day);
  const yearSum = year
    .toString()
    .split("")
    .map(Number)
    .reduce((sum, digit) => sum + digit, 0);
  results.C = reduceNumber(yearSum);
  results.D = reduceNumber(month + day + year);
  results.H = reduceNumber(month + year);
  results.X = reduceNumber(results.B + results.D);
  results.Y = reduceNumber(results.A + results.B + results.C + results.D + results.X);
  results.E = reduceNumber(results.A + results.B);
  results.F = reduceNumber(results.B + results.C);
  results.G = reduceNumber(results.E + results.F);
  results.I = reduceNumber(results.E + results.F + results.G);
  results.J = reduceNumber(results.D + results.H);

  const aNegative = convertMasterForNegatives(results.A);
  const bNegative = convertMasterForNegatives(results.B);
  const cNegative = convertMasterForNegatives(results.C);
  results.K = Math.abs(aNegative - bNegative);
  results.L = Math.abs(bNegative - cNegative);
  results.M =
    results.K !== results.L ? Math.abs(results.K - results.L) : reduceNumber(results.K + results.L);
  results.N = Math.abs(aNegative - cNegative);
  results.O = reduceNumber(results.M + results.K + results.L);
  results.P = reduceNumber(results.D + results.O);
  results.Q = reduceNumber(results.K + results.M);
  results.R = reduceNumber(results.L + results.M);
  results.S = reduceNumber(results.Q + results.R);
  results.W = calculateTriplicidad(results);
  results.Z = calculateZ(year);
  const absent = calculateAbsentNumbers(results);
  results.T = absent.length === 0 ? 0 : absent.length === 1 ? (absent[0] ?? 0) : absent;
  return results;
};

export const listMasterNumbers = (results: PinaculoResults): string[] =>
  (Object.entries(results) as [string, number | number[]][])
    .filter(([, value]) => typeof value === "number" && MASTER_NUMBERS.has(value))
    .map(([letter]) => letter);

export const lifeCycles = (results: PinaculoResults) => ({
  E: results.E,
  F: results.F,
  G: results.G,
  H: results.H,
});

export const pinnacleCycles = (results: PinaculoResults) => ({
  X: results.X,
  Y: results.Y,
  Z: results.Z,
});
