
export function GetOS(): "mac" | "win" | "unknown" {
    if (!navigator || !navigator.platform)
        return "unknown";
    const p = navigator.platform;
    return (p.includes("Mac") ? "mac" :
            p.includes("Win") ? "win" :
                                      "unknown");
}
