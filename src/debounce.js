export const debounce = (f, ms) => {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            f(...args)
            timeout = undefined
        }, ms)
    }
}