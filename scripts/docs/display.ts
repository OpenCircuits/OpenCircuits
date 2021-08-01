import {AccessModifier, Types, Method, Class} from "./model";


export function displayType(type: Types): string {
    return type.map(i =>
        i.map(({name, link}) =>
            link ? `<a href="${link}">${name}</a>` : name
        ).join(" & ")
    ).join(" | ");
}

export function displayModifier(mod: AccessModifier): string {
    return `<span style={{color: "purple", paddingLeft: "0px", backgroundColor: "transparent"}}>${mod}</span>`;
}


export function displayKeyword(word: string): string {
    return `<span style={{color: "#5295cc", paddingLeft: "0px", backgroundColor: "transparent"}}>${word}</span>`;
}


export function displayConstructor(c: Class): string {
    return `` +
        `\n<div className="wrapper">\n` +
            `\n#### <code>${displayModifier(c.constructor.access)} ${c.name}</code>\n` +
            c.constructor.overloads.map(cc =>
                `<div>` +
                    // Display type/docs for overload
                    `<h4><code>` +
                        `${displayKeyword("new")} ${c.name}(${cc.parameters.map(p => p.name).join(", ")})` +
                    `</code></h4>` +
                    `\n${cc.docs || "*Description needed*"}\n` +

                    // Display parameters of overload
                    (cc.parameters.length === 0 ? `` : `<h4>Parameters</h4>\n`) +
                    cc.parameters.map(p =>
                        `\n* <code>${p.name}: ${displayType(p.type)}</code> – ${p.docs || "*Description needed*"}\n`
                    ).join("") +
                `\n</div>\n\n`
            ).join("") +
        `\n</div>\n`;
}


export function displayFunc(f: Method): string {
    return `` +
        `\n<div className="wrapper func">\n` +
            // Display header and then each overload for the function
            `\n#### <code>${displayModifier(f.access)} ${f.name}</code>\n` +
            f.overloads.map(fo =>
                `<div>` +
                    // Display type/docs for overload
                    `<h4><code>` +
                        `${f.name}(${fo.parameters.map(p => p.name).join(", ")})` +
                    `</code></h4>` +
                    `\n${fo.docs || "<p>*Description needed*</p>"}\n` +

                    // Display parameters of overload
                    (fo.parameters.length === 0 ? `` : `\n<h4>Parameters</h4>\n`) +
                    fo.parameters.map(p =>
                        `\n* <code>${p.name}: ${displayType(p.type)}</code> – ${p.docs || "*Description needed*"}\n`
                    ).join("") +

                    // Display returns for overload
                    (fo.returns.length === 0 ? `` : `\n<h4>Returns</h4>\n`) +
                    fo.returns.map(r =>
                        // The space after the <code> tag is necessary (for some reason)
                        //  and activates the `code` tag background w/o actually showing the space
                        `\n* <code> ${displayType(r.type)}</code> – ${r.docs || "*Description needed*"}\n`
                    ).join("") +
                `\n</div>\n\n`
            ).join("") +
        `\n</div>\n`;
}


export function displayClass(c: Class): string {
    return `` +
        // Overview
        `## ${c.name}\n` +
        (c.docs || "*Overview needed*") +
        `\n\n---` +

        // Display constructor
        `\n\n### Constructor\n\n` +
        displayConstructor(c) +
        `\n---` +

        // Display properties
        `\n\n### Properties\n\n` +
        (c.properties.filter(p => p.access === "public").length === 0 ?
            `*No publicly accessible properties on ${c.name}*\n` : ``) +
        `\n` +
        c.properties.map(p => `` +
            `<div className="wrapper">\n\n` +
                `#### <code>${displayModifier(p.access)} ${p.name}: ${displayType(p.type)}</code>\n` +
                (p.docs || "*Description needed*") +
            `\n</div>\n`
        ).join("") +
        `\n---` +

        // Display methods
        `\n\n### Methods\n\n` +
        (c.methods.length === 0 ? `*No methods for ${c.name}\n` : ``) +
        c.methods.map(displayFunc).join("") +
        `\n---` +

        // Display static methods
        `\n\n### Static Methods\n\n` +
        (c.staticMethods.length === 0 ? `*No static methods for ${c.name}\n` : ``) +
        c.staticMethods.map(displayFunc).join("") +
        `\n---`;
}


export function generateMD(c: Class): string {
    return `` +
        `---\n` +
        `title: ${c.name}\n` +
        `description: ${c.name}\n` +
        `---\n\n` +

        displayClass(c);
}
