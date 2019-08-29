import $ from "jquery";

export function LoadExampleCircuit(id: string): Promise<string> {
    return $.when(
        $.ajax({
            method: "GET",
            url: `api/example/${id}`
        })
    );
}
