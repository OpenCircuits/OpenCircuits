const katex = require("rehype-katex");
const math = require("remark-math");

module.exports = {
  title: "OpenCircuits",
  tagline: "The free, online, circuit designer",
  url: "https://docs.opencircuits.io",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "OpenCircuits", // Usually your GitHub org/user name.
  projectName: "OpenCircuits", // Usually your repo name.
  stylesheets: [
    {
      href: "https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css",
      type: "text/css"
    },
  ],
  themeConfig: {
    navbar: {
      title: "OpenCircuits",
      logo: {
        alt: "OpenCircuits Logo",
        src: "img/icon.svg",
      },
      items: [
        {
          label: "Docs",
          type: "doc",
          docId: "Introduction",
          position: "left"
        },
        {
          label: "API",
          type: "doc",
          docId: "test",
          position: "left"
        },
        {
          label: "JSDocs",
          type: "doc",
          docId: "ts/app/Overview",
          position: "left"
        },
        {
          label: "Other",
          type: "doc",
          docId: "Other/References/References",
          position: "left"
        },
        {
          href: "https://github.com/OpenCircuits/OpenCircuits",
          label: "GitHub",
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
              label: "Style Guide",
              to: "/",
            },
            {
              label: "JSDocs",
              to: "/ts/app/Overview",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discordapp.com/invite/bCV2tYFer9",
            }
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/OpenCircuits/OpenCircuits",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenCircuits`,
    },
    prism: {
      theme: require("prism-react-renderer/themes/vsLight"),
      darkTheme: require("prism-react-renderer/themes/vsDark"),
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          path: "../../../../docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: ({ versionDocsDirPath, docPath }) => {
            if (docPath.startsWith("ts/")) { // JSDoc so edit page will be the TS file not doc file
              return `https://github.com/OpenCircuits/OpenCircuits/edit/master/src/${docPath.slice(3, -3)}.ts`;
            }
            return `https://github.com/OpenCircuits/OpenCircuits/edit/master/docs/${docPath}`;
          },
          remarkPlugins: [math],
          rehypePlugins: [katex]
        },
        theme: {
          customCss: [
            require.resolve("./src/css/custom.css")
          ]
        },
      },
    ],
  ],
  plugins: [],
};
