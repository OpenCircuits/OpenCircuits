type Props = {
    method: "GET" | "POST" | "PUT";
    url: string;
    headers: Record<string, string>;
    data?: string;
    async?: boolean;
}
type TextProps = Props & {
    responseType?: "" | "text";
}
type ByteProps = Props & {
    responseType: "arraybuffer";
}

export function Request(props: TextProps): Promise<string>;
export function Request(props: ByteProps): Promise<ArrayBuffer>;
export function Request({ method, url, headers, data, async, responseType }: TextProps | ByteProps): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        if (responseType) {
            xhr.responseType = responseType;
        }

        // Open request
        xhr.open(method, url, async ?? true);

        // Set headers
        Object.entries(headers).forEach(([name, value]) => xhr.setRequestHeader(name, value));

        xhr.addEventListener("load", function() {
            if (this.status >= 200 && this.status < 400)
                {resolve(this.response);}
            else
                {reject(this.response);}
        });
        xhr.addEventListener("abort", (ev) => reject(ev));
        xhr.addEventListener("error", (ev) => reject(ev));
        xhr.addEventListener("timeout", (ev) => reject(ev));

        xhr.send(data);
    })
}
