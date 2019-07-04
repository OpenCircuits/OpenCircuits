
export const Utils = (function() {
    return {
        escapeFileName(n: string): string {
            // Credit: https://stackoverflow.com/a/8485137/2972004
            return n.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        }
    }
})();
