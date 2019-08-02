
export const ExampleCircuitListView = (() => {
    return {
        RenderCircuitList(names: string[]): string {
            let html = "<div>";

            for (let name of names) {
                const nameB64 = btoa(name);
                html += "<div class='example-circuit-container' id='example-circuit-" + nameB64 + "'>name</div>";
            }

            html += "</div>";
            return html;
        }
    }
})();
