'use strict'

/**
 * @param {string} elementId
 */
function identify(elementId) {
    const res = document.getElementById(elementId)
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

/**
 * @param {number} width
 * @param {number} height
 * @returns {number[][]}
 */
function buildMatrix(width, height) {
    const res = []
    for (let y = 0; y < height; y++) {
        res.push([])
        for (let x = 0; x < width; x++) {
            res[y].push(0)
        }
    }
    return res
}

/**
 * @param {number} width
 * @param {number} height
 */
function Grid(width, height) {
    // + 2 is for borders padding compensation, so grid will be finite.
    width += 2
    height += 2

    this.width = width
    this.height = height
    this.cells = buildMatrix(width, height)
}

/**
 * @param {() => number} rand
 */
Grid.prototype.randomize = function(rand) {
    for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
            this.cells[y][x] = rand() % 2
        }
    }
}

/**
 * @param {Uint8ClampedArray} buffer
 */
Grid.prototype.packImageData = function(buffer) {
    for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
            const pixelOffset = ((y - 1) * (this.width - 2) + (x - 1)) * 4

            // RGBA(34, 34, 34, 1) is just #222
            if (this.cells[y][x] === 1) {
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
 * @param {Grid} next
 */
Grid.prototype.transformTo = function(next) {
    for (let row = 1; row < this.height - 1; row++) {
        for (let col = 1; col < this.width - 1; col++) {
            // Sum neighbors that are alive to count them.
            const neightborsAlive =
                this.cells[row - 1][col - 1] +
                this.cells[row - 1][col    ] +
                this.cells[row - 1][col + 1] +
                this.cells[row    ][col - 1] +
                this.cells[row    ][col + 1] +
                this.cells[row + 1][col - 1] +
                this.cells[row + 1][col    ] +
                this.cells[row + 1][col + 1]

            // Check if cell will be alive by Conway's Life rules.
            if (neightborsAlive === 3) {
                next.cells[row][col] = 1
            } else if (neightborsAlive === 2 && this.cells[row][col] === 1) {
                next.cells[row][col] = 1
            } else {
                next.cells[row][col] = 0
            }
        }
    }
}

/**
 * @param {HTMLCanvasElement} canvas
 */
function Automata(canvas) {
    const context = canvas.getContext('2d')
    if (!context) {
        throw new Error('Failed to instantiate canvas context')
    }

    this.isRunning = false
    this.iterationsPerRender = 1
    this.context = context
    this.imageData = context.createImageData(canvas.width, canvas.height)
    this.activeGrid = new Grid(canvas.width, canvas.height)
    this.passiveGrid = new Grid(canvas.width, canvas.height)
}

Automata.prototype.randomize = function() {
    const rand = minstdRand(Date.now())
    this.activeGrid.randomize(rand)
}

Automata.prototype.draw = function() {
    this.activeGrid.packImageData(this.imageData.data)
    this.context.putImageData(this.imageData, 0, 0)
}

Automata.prototype.calcStep = function() {
    const temp = this.activeGrid
    this.activeGrid = this.passiveGrid
    this.passiveGrid = temp
    this.passiveGrid.transformTo(this.activeGrid)
}

Automata.prototype.loop = function() {
    if (this.isRunning) {
        window.requestAnimationFrame(() => this.loop())

        for (let iter = 0; iter < this.iterationsPerRender; iter++) {
            this.calcStep()
        }

        this.draw()
    }
}

Automata.prototype.doStart = function() {
    this.isRunning = true
    this.loop()
}

Automata.prototype.doStep = function() {
    this.calcStep()
    this.draw()
}

Automata.prototype.doPause = function() {
    this.isRunning = false
}

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
    const width = container.clientWidth
    const height = container.clientHeight

    grid.width = width
    grid.height = height

    xSize.innerText = width.toString()
    ySize.innerText = height.toString()
    totalSize.innerText = (width * height).toString()

    if (auto) {
        auto.doPause()
    }

    updateViews(false)
    disableButtons()
}

const container = identify('container')
const info = identify('info')
const grid = identify('grid')

const btnRand = identify('btn-rand')
const btnStart = identify('btn-start')
const btnStep = identify('btn-step')
const btnPause = identify('btn-pause')

const xSize = identify('x-size')
const ySize = identify('y-size')
const totalSize = identify('total-size')

let auto
expandGrid()
window.addEventListener('resize', expandGrid)

btnRand.addEventListener('click', () => {
    if (auto) {
        auto.doPause()
    }

    expandGrid()
    auto = new Automata(grid)
    auto.randomize()
    auto.draw()

    updateViews(true)
    updateButtons(auto.isRunning)
})

btnStart.addEventListener('click', () => {
    auto.doStart()
    updateButtons(auto.isRunning)
})

btnStep.addEventListener('click', () => {
    auto.doStep()
})

btnPause.addEventListener('click', () => {
    auto.doPause()
    updateButtons(auto.isRunning)
})
