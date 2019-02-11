import { Grid, initGrid, randomizeGrid, packImageData, transformTo } from './grid'

export interface Automata {
    isRunning: boolean
    iterationsPerRender: number
    context: CanvasRenderingContext2D
    imageData: ImageData
    activeGrid: Grid
    passiveGrid: Grid
}

export function initAutomata(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d')
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
    } as Automata
}

function minstdRand(state: number) {
    return () => (state = 48271 * state % 2147483647)
}

export function randomizeAutomata(auto: Automata) {
    randomizeGrid(auto.activeGrid, minstdRand(Date.now()))
}

export function drawActiveGrid(auto: Automata) {
    packImageData(auto.activeGrid, auto.imageData.data)
    auto.context.putImageData(auto.imageData, 0, 0)
}

function calcStep(auto: Automata) {
    const temp = auto.activeGrid
    auto.activeGrid = auto.passiveGrid
    auto.passiveGrid = temp

    transformTo(auto.passiveGrid, auto.activeGrid)
}

function loop(auto: Automata) {
    if (auto.isRunning) {
        window.requestAnimationFrame(() => loop(auto))

        for (let iter = 0; iter < auto.iterationsPerRender; iter++) {
            calcStep(auto)
        }

        drawActiveGrid(auto)
    }
}

export function doStart(auto: Automata) {
    auto.isRunning = true
    loop(auto)
}

export function doStep(auto: Automata) {
    calcStep(auto)
    drawActiveGrid(auto)
}

export function doPause(auto: Automata) {
    auto.isRunning = false
}
