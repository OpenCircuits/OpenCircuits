/* eslint-disable sonarjs/no-nested-template-literals */
import {escapeStr} from "./utils.js";

import type {Class, Method, MethodSignature, TSDoc, Types} from "./model";


const Colors = {
    modifier:  "purple",
    keyword:   "#5295cc",
    primitive: "#18598f",
};

export function displaySpecial(text: string, color: string): string {
    return `<span style={{color: "${color}", paddingLeft: "0px", backgroundColor: "transparent"}}>${text}</span>`;
}

export function displayType(type: Types): string {
    const isArray = (type.length > 0 && type[0].length > 0 && Array.isArray(type[0][0].type));

    // If the type is a single array whose type is a union/intersection, then wrap with parenthesis
    const shouldWrap = (isArray &&
                            // Array's element has a union of >1 elements
                            type[0][0].type.length > 1 ||
                            // Or Array's element has a intersection of >1 elements
                            (type[0][0].type.length === 1 && type[0][0].type[0].length > 1));

    return `${shouldWrap ? "(" : ""}${
        type.map((i) =>
            i.map(({ type, args, link }) => {
                if (Array.isArray(type))
                    return displayType(type);
                const str = `${escapeStr(type)}${
                    // Show generic arguments
                    args && args.length > 0 ?
                        `&lt;${args.map(displayType).join(", ")}&gt;` :
                        ""
                }`;
                return link ? `<a href="${link}">${str}</a>` : displaySpecial(str, Colors.primitive);
            }).join(" & ")
        ).join(" | ")
    }${shouldWrap ? ")" : ""}${isArray ? "[]" : ""}`;
}

export function displayGenerics(generics: Class["generics"]): string {
    if (!generics)
        return "";
    return "&lt;" +
        generics.map((g) => `${g.name}${g.constraint ? ` extends ${displayType(g.constraint)}` : ""}`).join(", ") +
    "&gt;";
}


export function displayConstructor(c: Class): string {
    return "" +
        "\n<div className=\"wrapper\">\n" +
            `\n#### <code>${displaySpecial(c.constructor!.access, Colors.modifier)} ${c.name}</code>\n` +
            c.constructor!.overloads.map((cc) =>
                "<div>" +
                    // Display type/docs for overload
                    "<h4><code>" +
                        `${displaySpecial("new", Colors.keyword)} ${c.name}(${
                            cc.parameters.map((p) => escapeStr(p.name)).join(", ")
                        })` +
                    "</code></h4>" +
                    `\n${cc.docs || "*Description needed*"}\n` +

                    // Display parameters of overload
                    (cc.parameters.length === 0 ? "" : "<h4>Parameters</h4>\n") +
                    cc.parameters.map((p) =>
                        //   | this HTML space character is needed because idfk, but it makes
                        //   V   the JSDocs for the rest of the line actually function
                        `\n* &nbsp;<code>${escapeStr(p.name)}: ${
                            displayType(p.type)}</code> – ${p.docs || "*Description needed*"
                        }\n`
                    ).join("") +
                "\n</div>\n\n"
            ).join("") +
        "\n</div>\n";
}


export function displayFunc(f: Method, global = false): string {
    const displaySignature = (fo: MethodSignature) => "" +
        // Display type/docs for overload
        "<h4><code>" +
            `${f.name}(${fo.parameters.map((p) => escapeStr(p.name)).join(", ")})` +
            ` => ${fo.returns.length > 0 ?
                fo.returns.map((r) => displayType(r.type)).join(" | ") :
                displaySpecial(escapeStr("void")!, Colors.primitive)}` +
        "</code></h4>" +
        `\n${fo.docs || "\n*Description needed*\n"}\n` +

        // Display parameters of overload
        (fo.parameters.length === 0 ? "" : "\n<h4>Parameters</h4>\n") +
        fo.parameters.map((p) =>
            //   | this HTML space character is needed because idfk, but it makes
            //   V   the JSDocs for the rest of the line actually function
            `\n* &nbsp;<code>${escapeStr(p.name)}: ${displayType(p.type)}</code> ` +
            `– ${p.docs || "*Description needed*"}\n`
        ).join("") +

        // Display returns for overload
        (fo.returns.length === 0 ? "" : "\n<h4>Returns</h4>\n") +
        fo.returns.map((r) =>
            // The space after the <code> tag is necessary (for some reason)
            //  and activates the `code` tag background w/o actually showing the space
            //   | this HTML space character is needed because idfk, but it makes
            //   V   the JSDocs for the rest of the line actually function
            `\n* &nbsp;<code> ${displayType(r.type)}</code> – ${r.docs || "*Description needed*"}\n`
        ).join("");

    return "" +
        "\n<div className=\"wrapper func\">\n" +
            // Display header and then each overload for the function
            `\n${global ?
                `## ${f.name}` :
                `#### <code>${displaySpecial(f.access, Colors.modifier)} ${f.name}</code>`}\n` +
            `\n\n${f.overloads.length > 0 ? (f.docs || "") : ""}\n\n` +
            f.overloads.map((fo) =>
                `<div>${displaySignature(fo)}\n</div>\n\n`
            ).join("") +
            // If no overloads, then just display signature
            (f.overloads.length === 0 ? displaySignature(f.implementation) : "") +
        "\n</div>\n";
}


export function displayClass(c: Class): string {
    return "" +
        // Overview, display name + generics
        `## ${c.name}${c.generics.length > 0 ? `&lt;${c.generics.map((g) => g.name).join(", ")}&gt;` : ""}\n` +
        (c.docs || "*Overview needed*") +
        "\n\n" +
        // Display generics
        (c.generics.length === 0 ? "" : "\n<h4>Template Parameters</h4>\n") +
        c.generics.map((g) =>
            `\n* <code> ${g.name}${
                // Display generic name w/ constraint type if it has any
                g.constraint ?
                    ` ${displaySpecial("extends", Colors.keyword)} ${displayType(g.constraint)}` : ""
            }</code> – ${g.docs || "*Description needed*"}`
        ).join("") +
        "\n\n---" +

        // Display constructor
        (c.constructor ?
            "\n\n### Constructor\n\n" +
            displayConstructor(c) +
            "\n---"
        : "") +

        // Display properties
        "\n\n### Properties\n\n" +
        (c.properties.filter((p) => p.access === "public").length === 0 ?
            `*No publicly accessible properties on ${c.name}*\n` : "") +
        "\n" +
        c.properties.map((p) => "" +
            "<div className=\"wrapper\">\n\n" +
                `#### <code>${displaySpecial(p.access, Colors.modifier)} ${p.name}: ${displayType(p.type)}</code>\n` +
                (p.docs || "*Description needed*") +
            "\n</div>\n"
        ).join("") +
        "\n---" +

        // Display methods
        "\n\n### Methods\n\n" +
        (c.methods.length === 0 ? `*No methods for ${c.name}*\n` : "") +
        c.methods.map((f) => displayFunc(f, false)).join("") +
        "\n---" +

        // Display static methods
        "\n\n### Static Methods\n\n" +
        (c.staticMethods.length === 0 ? `*No static methods for ${c.name}*\n` : "") +
        c.staticMethods.map((f) => displayFunc(f, false)).join("") +
        "\n---";
}


export function generateMD(doc: TSDoc): string {
    const name = doc.fileName.split(".")[0];

    return "" +
        "---\n" +
        `title: ${name}\n` +
        `description: ${name}\n` +
        "---\n\n" +

        doc.classes.map(displayClass).join("\n\n") +
        "\n\n" +
        // Only display 'Functions' header
        //  if we have functions to display in this file
        //  and there is another class in the file, otherwise showing
        //   the header is pointless since it's all functions
        (doc.functions.length > 0 && doc.classes.length > 0 ? "# Functions\n\n" : "") +
        doc.functions.map((f) => displayFunc(f, true)).join("\n\n");
}
