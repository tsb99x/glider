import { identify } from './util'
import { Automata, initAutomata, drawActiveGrid, doPause, doStart, doStep, randomizeAutomata } from './automata'

const container: HTMLCanvasElement = identify('container')
const info: HTMLElement = identify('info')
const grid: HTMLCanvasElement = identify('grid')

const btnRand: HTMLButtonElement = identify('btn-rand')
const btnStart: HTMLButtonElement = identify('btn-start')
const btnStep: HTMLButtonElement = identify('btn-step')
const btnPause: HTMLButtonElement = identify('btn-pause')

const xSize: HTMLSpanElement = identify('x-size')
const ySize: HTMLSpanElement = identify('y-size')
const totalSize: HTMLSpanElement = identify('total-size')

let auto: Automata | null = null

// Global update actions.

function updateViews(isGrid: boolean) {
    if (isGrid) {
        info.classList.add('hidden')
        grid.classList.remove('hidden')
    } else {
        grid.classList.add('hidden')
        info.classList.remove('hidden')
    }
}

function updateButtons(isAutomataRunning: boolean) {
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
        doPause(auto)
    }

    updateViews(false)
    disableButtons()
}

expandGrid()
window.addEventListener('resize', expandGrid)

// Button-specific binds.

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
    doStart(auto!)
    updateButtons(auto!.isRunning)
})

btnStep.addEventListener('click', () => {
    doStep(auto!)
})

btnPause.addEventListener('click', () => {
    doPause(auto!)
    updateButtons(auto!.isRunning)
})
