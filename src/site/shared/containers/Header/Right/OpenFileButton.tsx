import React from "react";

export const OpenFileButton = () => {
    const fileInput = React.useRef<HTMLInputElement>(null);

    return (
        <div>
            <input type="file" ref={fileInput} multiple={false} accept=".circuit,.json" style={{display: "none"}} />
            <button type="button" title="Open file" onClick={() => fileInput.current?.click()}>
                <img src="img/icons/open.svg" height="100%" alt="Open a file"/>
            </button>
        </div>
    );
}
