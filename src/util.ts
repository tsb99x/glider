export function identify<T extends HTMLElement>(id: string) {
    const res = document.getElementById(id)
    if (!res) {
        throw new Error(`Failed to find element with id of '${id}' in document`)
    }
    return res as T
}
