/* eslint-disable unicorn/no-document-cookie */

// Adapted from https://www.w3schools.com/js/js_cookies.asp

export function GetCookie(cname: string): string {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let c of ca) {
        while (c.charAt(0) === " ")
            c = c.slice(1);
        if (c.indexOf(name) === 0)
            return c.slice(name.length, c.length);
    }
    return "";
}

export function SetCookie(cname: string, cvalue: string, exdays = 1000): void {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
