
export function GetOS(): "mac" | "win" | "unknown" {
    if (!navigator || !navigator.platform)
return "unknown";
    const p = navigator.platform;
    return (p.indexOf("Mac") !== -1 ? "mac" :
            p.indexOf("Win") !== -1 ? "win" :
                                      "unknown");
}
