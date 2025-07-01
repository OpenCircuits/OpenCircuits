export function GetAuthMethods(): string[] {
    if ((process.env.OC_AUTH_TYPES ?? "").trim().length === 0)
        return [];
    return process.env.OC_AUTH_TYPES!.split(" ");
}
