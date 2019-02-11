import { identify } from './util'
import { Automata, initAutomata, drawActiveGrid, doPause, doStart, doStep, randomizeAutomata } from './automata'

// Automata element.

let auto: Automata | null = null

// Layout setup.

const container: HTMLCanvasElement = identify('container')
const info: HTMLElement = identify('info')
const grid: HTMLCanvasElement = identify('grid')

// Dynamic text parts and resize.

const xSize: HTMLSpanElement = identify('x-size')
const ySize: HTMLSpanElement = identify('y-size')
const totalSize: HTMLSpanElement = identify('total-size')

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
}

expandGrid()
window.addEventListener('resize', expandGrid)

// Button identification and context-binding.

const btnRand: HTMLButtonElement = identify('btn-rand')
const btnStart: HTMLButtonElement = identify('btn-start')
const btnStep: HTMLButtonElement = identify('btn-step')
const btnPause: HTMLButtonElement = identify('btn-pause')

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

// Button actions.

btnRand.addEventListener('click', () => {
    if (auto) {
        doPause(auto)
    }

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
