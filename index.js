'use strict'

// Global utilities

/**
 * @param {string} elementId
 */
function identify(elementId) {
    var res = document.getElementById(elementId)

    if (!res) {
        throw new Error(`Failed to find element with id of '${elementId}' in document`)
    }
    return res
}

/**
 * @param {number} state
 */
function minstdRand(state) {
    return () => (state = 48271 * state % 2147483647)
}

// Grid implementation

/**
 * @typedef {Object} Grid
 * @property {number} width
 * @property {number} height
 * @property {number[][]} cells
 */

/**
 * @param {number} width
 * @param {number} height
 * @returns {Grid}
 */
function initGrid(width, height) {
    var cells, y, x

    // + 2 is for borders padding compensation, so grid will be finite.
    width += 2
    height += 2

    // Create 2D cells structure with every cell dead (0 state).
    cells = []
    for (y = 0; y < height; y++) {
        cells.push([])
        for (x = 0; x < width; x++) {
            cells[y].push(0)
        }
    }

    return {
        width,
        height,
        cells
    }
}

/**
 *
 * @param {Grid} grid
 * @param {() => number} rand
 */
function randomizeGrid(grid, rand) {
    var y, x

    for (y = 1; y < grid.height - 1; y++) {
        for (x = 1; x < grid.width - 1; x++) {
            grid.cells[y][x] = rand() % 2
        }
    }
}

/**
 * @param {Grid} grid
 * @param {Uint8ClampedArray} buffer
 */
function packImageData(grid, buffer) {
    var y, x, pixelOffset

    for (y = 1; y < grid.height - 1; y++) {
        for (x = 1; x < grid.width - 1; x++) {
            pixelOffset = ((y - 1) * (grid.width - 2) + (x - 1)) * 4

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

/**
 * @param {Grid} current
 * @param {Grid} next
 */
function transformTo(current, next) {
    var row, col, neightborsAlive

    for (row = 1; row < current.height - 1; row++) {
        for (col = 1; col < current.width - 1; col++) {
            // Sum neighbors that are alive to count them.
            neightborsAlive =
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

// Automata implementation

/**
 * @typedef {Object} Automata
 * @property {boolean} isRunning
 * @property {number} iterationsPerRender
 * @property {CanvasRenderingContext2D} context
 * @property {ImageData} imageData
 * @property {Grid} activeGrid
 * @property {Grid} passiveGrid
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {Automata}
 */
function initAutomata(canvas) {
    var context = canvas.getContext('2d')

    if (!context) {
        throw new Error('Failed to instantiate canvas context')
    }

    return {
        isRunning: false,
        iterationsPerRender: 1,
        context,
        imageData: context.createImageData(canvas.width, canvas.height),
        activeGrid: initGrid(canvas.width, canvas.height),
        passiveGrid: initGrid(canvas.width, canvas.height),
    }
}

/**
 * @param {Automata} auto
 */
function randomizeAutomata(auto) {
    randomizeGrid(auto.activeGrid, minstdRand(Date.now()))
}

/**
 * @param {Automata} auto
 */
function drawActiveGrid(auto) {
    packImageData(auto.activeGrid, auto.imageData.data)
    auto.context.putImageData(auto.imageData, 0, 0)
}

/**
 * @param {Automata} auto
 */
function calcStep(auto) {
    var temp = auto.activeGrid

    auto.activeGrid = auto.passiveGrid
    auto.passiveGrid = temp
    transformTo(auto.passiveGrid, auto.activeGrid)
}

/**
 * @param {Automata} auto
 */
function loop(auto) {
    var iter

    if (auto.isRunning) {
        window.requestAnimationFrame(() => loop(auto))

        for (iter = 0; iter < auto.iterationsPerRender; iter++) {
            calcStep(auto)
        }

        drawActiveGrid(auto)
    }
}

/**
 * @param {Automata} auto
 */
function doStart(auto) {
    auto.isRunning = true
    loop(auto)
}

/**
 * @param {Automata} auto
 */
function doStep(auto) {
    calcStep(auto)
    drawActiveGrid(auto)
}

/**
 * @param {Automata} auto
 */
function doPause(auto) {
    auto.isRunning = false
}

// Global update actions.

/**
 * @param {boolean} isGrid
 */
function updateViews(isGrid) {
    if (isGrid) {
        info.classList.add('hidden')
        grid.classList.remove('hidden')
    } else {
        grid.classList.add('hidden')
        info.classList.remove('hidden')
    }
}

/**
 * @param {boolean} isAutomataRunning
 */
function updateButtons(isAutomataRunning) {
    btnStart.disabled = isAutomataRunning
    btnStep.disabled = isAutomataRunning
    btnPause.disabled = !isAutomataRunning
}

function disableButtons() {
    btnStart.disabled = true
    btnStep.disabled = true
    btnPause.disabled = true
}

function expandGrid() {
    var width = container.clientWidth
    var height = container.clientHeight

    grid.width = width
    grid.height = height

    xSize.innerText = width.toString()
    ySize.innerText = height.toString()
    totalSize.innerText = (width * height).toString()

    if (auto) {
        doPause(auto)
    }

    updateViews(false)
    disableButtons()
}

// Page elements lookup

var container = identify('container')
var info = identify('info')
var grid = identify('grid')

var btnRand = identify('btn-rand')
var btnStart = identify('btn-start')
var btnStep = identify('btn-step')
var btnPause = identify('btn-pause')

var xSize = identify('x-size')
var ySize = identify('y-size')
var totalSize = identify('total-size')

// Automata initialization and window events

var auto
expandGrid()
window.addEventListener('resize', expandGrid)

// Button-specific binds

btnRand.addEventListener('click', () => {
    if (auto) {
        doPause(auto)
    }

    expandGrid()
    auto = initAutomata(grid)
    randomizeAutomata(auto)
    drawActiveGrid(auto)

    updateViews(true)
    updateButtons(auto.isRunning)
})

btnStart.addEventListener('click', () => {
    doStart(auto)
    updateButtons(auto.isRunning)
})

btnStep.addEventListener('click', () => {
    doStep(auto)
})

btnPause.addEventListener('click', () => {
    doPause(auto)
    updateButtons(auto.isRunning)
})
