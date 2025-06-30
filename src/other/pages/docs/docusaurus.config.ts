import {themes as prismThemes} from "prism-react-renderer";
import type {Config} from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don"t use client-side code here (browser APIs, JSX...)

const config: Config = {
    title:   "OpenCircuits",
    tagline: "The free, online, circuit designer",
    favicon: "img/favicon.ico",

    // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
    future: {
        v4: true, // Improve compatibility with the upcoming Docusaurus v4
    },

    // Set the production url of your site here
    url:     "https://docs.opencircuits.com",
    // Set the /<baseUrl>/ pathname under which your site is served
    // For GitHub pages deployment, it is often "/<projectName>/"
    baseUrl: "/",

    // GitHub pages deployment config.
    // If you aren"t using GitHub pages, you don"t need these.
    organizationName: "OpenCircuits", // Usually your GitHub org/user name.
    projectName:      "OpenCircuits", // Usually your repo name.

    onBrokenLinks:         "throw",
    onBrokenMarkdownLinks: "warn",

    // Even if you don"t use internationalization, you can use this field to set
    // useful metadata like html lang. For example, if your site is Chinese, you
    // may want to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales:       ["en"],
    },

    presets: [
        [
            "classic",
            {
                docs: {
                    path:          "../../../../docs",
                    routeBasePath: "/",
                    sidebarPath:   "./sidebars.ts",
                    editUrl:       ({ docPath }) =>
                        `https://github.com/OpenCircuits/OpenCircuits/edit/master/docs/${docPath}`,
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],

    themeConfig: {
        // Replace with your project"s social card
        image:  "img/docusaurus-social-card.jpg",
        navbar: {
            title: "OpenCircuits",
            logo:  {
                alt: "OpenCircuits Logo",
                src: "img/icon.svg",
            },
            items: [
                {
                    label:     "Docs",
                    type:      "docSidebar",
                    sidebarId: "introSidebar",
                    position:  "left",
                },
                {
                    label:     "API",
                    type:      "docSidebar",
                    sidebarId: "apiSidebar",
                    position:  "left",
                },
                {
                    label:     "Other",
                    type:      "docSidebar",
                    sidebarId: "otherSidebar",
                    position:  "left",
                },
                {
                    href:     "https://github.com/OpenCircuits/OpenCircuits",
                    label:    "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Introduction",
                            to:    "/",
                        },
                        {
                            label: "Installation",
                            to:    "/Introduction/GettingStarted/Installation",
                        },
                        {
                            label: "API",
                            to:    "/API",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Discord",
                            href:  "https://discord.gg/bCV2tYFer9",
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "GitHub",
                            href:  "https://github.com/OpenCircuits/OpenCircuits",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} OpenCircuits. Built with Docusaurus.`,
        },
        prism: {
            theme:     prismThemes.vsLight,
            darkTheme: prismThemes.vsDark,
        },
    } satisfies Preset.ThemeConfig,
};

export default config;
