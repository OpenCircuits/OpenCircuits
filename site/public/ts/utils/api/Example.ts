
export function LoadExampleCircuit(id: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "api/example/" + id);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(xhr.responseText);
            }
        };
        xhr.send();
    });
}
