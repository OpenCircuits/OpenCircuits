
// Recommend specifically for keyboard shortcut detection
//  https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#examples
export function GetOS(): "mac" | "win" | "unknown" {
    if (!navigator || !navigator.platform)
        return "unknown";
    const p = navigator.platform;
    return (
        p.includes("Mac") ? "mac" :
        p.includes("Win") ? "win" :
                            "unknown"
    );
}
