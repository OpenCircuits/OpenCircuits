
// Recommend specifically for keyboard shortcut detection
//  https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#examples
export function GetOS(): "mac" | "win" | "unknown" {
    if (!navigator || !navigator.userAgent)
        return "unknown";
    const p = navigator.userAgent.toLowerCase();
    return (
        p.includes("mac") ? "mac" :
        p.includes("win") ? "win" :
                            "unknown"
    );
}
