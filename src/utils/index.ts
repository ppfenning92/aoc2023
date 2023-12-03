export const toInt = (v: string) => parseInt(v, 10);
export const sumReducer = (sum: number, x: string | number): number => (sum += toInt(`${x}`));

export const parseMatrix = (v: string) => {
    return v
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => l.split(''));
};

export const printMatrix = (m: any[][]) => {
    m.forEach((l) => console.log(l));
};

type Direction =
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left';

export type Coords = {
    [key in Direction]?: [number, number];
};

export const getAdjacentCoords = (
    r: number,
    c: number,
    maxRow: number,
    maxCol: number,
    diagonal = false
) => {
    const coords: Coords = {};
    // top
    if (r - 1 >= 0) {
        coords['top'] = [r - 1, c];
    }

    // bottom
    if (r + 1 <= maxRow) {
        coords['bottom'] = [r + 1, c];
    }

    // left
    if (c - 1 >= 0) {
        coords['left'] = [r, c - 1];
    }

    // right
    if (c + 1 <= maxCol) {
        coords['right'] = [r, c + 1];
    }

    if (!diagonal) return coords;

    // top-right
    if (r - 1 >= 0 && c + 1 <= maxCol) {
        coords['top-right'] = [r - 1, c + 1];
    }

    // top-left
    if (r - 1 >= 0 && c - 1 >= 0) {
        coords['top-left'] = [r - 1, c - 1];
    }

    // bottom-right
    if (r + 1 <= maxRow && c + 1 <= maxCol) {
        coords['bottom-right'] = [r + 1, c + 1];
    }

    // bottom-left
    if (r + 1 <= maxRow && c - 1 >= 0) {
        coords['bottom-left'] = [r + 1, c - 1];
    }

    return coords;
};
