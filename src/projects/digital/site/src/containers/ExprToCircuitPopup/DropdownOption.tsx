import React from "react";

import "./index.scss";

type Props<T> = {
    readonly id: string;
    readonly option: T;
    readonly options: T[];
    readonly setOption: React.Dispatch<React.SetStateAction<T>>;
    readonly text: string;
};
export const DropdownOption = <T extends string>({ id, option, options, setOption, text }: Props<T>) => (
    <>
        <br />
        <label htmlFor={id}>{text}</label>
        <select
            id={id}
            value={option}
            onChange={(e) => setOption(e.target.value as T)}
            onBlur={(e) => setOption(e.target.value as T)}
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </>
);
