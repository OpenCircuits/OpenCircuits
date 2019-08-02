
export const RemoteCircuitController = (() => {
    return {
        LoadExampleCircuitList: () => new Promise<string[]>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "api/examples");
            xhr.onload = () => {
                if (xhr.status == 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.send();
        }),
        LoadExampleCircuit: (id: string) => new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "api/example/" + id);
            xhr.onload = () => {
                if (xhr.status == 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.send();
        })
    }
})();
