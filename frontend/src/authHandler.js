export let handleAuthFailure = null;

export function setAuthFailureHandler(fn) {
    handleAuthFailure = fn;
}