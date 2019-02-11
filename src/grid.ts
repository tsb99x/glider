export interface Grid {
    width: number,
    height: number,
    cells: number[][]
}

export function initGrid(width: number, height: number) {
    // + 2 is for borders padding compensation, so grid will be finite.
    width += 2
    height += 2

    // Create 2D cells structure with every cell dead (0 state).
    const cells: number[][] = []
    for (let y = 0; y < height; y++) {
        cells.push([])
        for (let x = 0; x < width; x++) {
            cells[y].push(0)
        }
    }

    return {
        width,
        height,
        cells
    } as Grid
}

export function randomizeGrid(grid: Grid, rand: () => number) {
    for (let y = 1; y < grid.height - 1; y++) {
        for (let x = 1; x < grid.width - 1; x++) {
            grid.cells[y][x] = rand() % 2
        }
    }
}

export function packImageData(grid: Grid, buffer: Uint8ClampedArray) {
    for (let y = 1; y < grid.height - 1; y++) {
        for (let x = 1; x < grid.width - 1; x++) {
            const pixelOffset = ((y - 1) * (grid.width - 2) + (x - 1)) * 4

            // RGBA(34, 34, 34, 1) is just #222
            if (grid.cells[y][x] === 1) {
                buffer[pixelOffset + 0] = 34
                buffer[pixelOffset + 1] = 34
                buffer[pixelOffset + 2] = 34
            // RGBA(238, 238, 238, 1) is just #EEE
            } else {
                buffer[pixelOffset + 0] = 238
                buffer[pixelOffset + 1] = 238
                buffer[pixelOffset + 2] = 238
            }
            // Alpha component is always 1
            buffer[pixelOffset + 3] = 255
        }
    }
}

export function transformTo(current: Grid, next: Grid) {
    for (let row = 1; row < current.height - 1; row++) {
        for (let col = 1; col < current.width - 1; col++) {
            // Sum neighbors that are alive to count them.
            const neightborsAlive =
                current.cells[row - 1][col - 1] +
                current.cells[row - 1][col    ] +
                current.cells[row - 1][col + 1] +
                current.cells[row    ][col - 1] +
                current.cells[row    ][col + 1] +
                current.cells[row + 1][col - 1] +
                current.cells[row + 1][col    ] +
                current.cells[row + 1][col + 1]

            // Check if cell will be alive by Conway's Life rules.
            if (neightborsAlive === 3) {
                next.cells[row][col] = 1
            } else if (neightborsAlive === 2 && current.cells[row][col] === 1) {
                next.cells[row][col] = 1
            } else {
                next.cells[row][col] = 0
            }
        }
    }
}
