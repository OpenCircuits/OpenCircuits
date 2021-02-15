import React from "react";


export type OnLoadFunc = (file: File) => void;

type Props = {
    onLoad: OnLoadFunc;
}
export const OpenFileButton = ({onLoad}: Props) => {
    const fileInput = React.useRef<HTMLInputElement>(null);

    return (
        <div>
            <input type="file" ref={fileInput} multiple={false} accept=".circuit,.json"
                   style={{display: "none"}}
                   onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0)
                            onLoad(e.target.files[0])}
                   } />
            <button type="button" title="Open file" onClick={() => fileInput.current?.click()}>
                <img src="img/icons/open.svg" height="100%" alt="Open a file"/>
            </button>
        </div>
    );
}
