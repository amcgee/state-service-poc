export const debounce = (f, ms) => {
    let timeout
    return (...args) => {
        if (timeout) {
            return;
        }
        timeout = setTimeout(() => {
            f(...args)
            timeout = undefined
        }, ms)
    }
}