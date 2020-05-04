export const debounce = (f, ms) => {
    let timeout
    return () => {
        if (timeout) {
            return;
        }
        timeout = setTimeout(() => {
            f()
            timeout = undefined
        }, ms)
    }
}
