import React, {useEffect, useRef, useState} from "react";
import "./index.scss";


type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    onEnter?: (e: KeyboardEvent) => void;
}
export const InputField = React.forwardRef(({onEnter, ...props}: Props, ref: React.RefObject<HTMLInputElement>) => {
    ref = ref ?? useRef<HTMLInputElement>();

    useEffect(() => {
        if (!ref.current)
            throw new Error("InputField.useEffect failed: ref.current is null");
        ref.current.addEventListener("keyup", function (evt) {
            if (evt.key === "Escape" || evt.key === "Enter")
                ref.current!.blur();

            if (evt.key === "Enter" && onEnter)
                onEnter(evt);
        });
    }, [ref]);

    return <input ref={ref} {...props} />
});

type NumberProps = Props & {
    step?: number;

    onIncrement?: (step: number) => void;
    onDecrement?: (step: number) => void;
}
export const NumberInputField = React.forwardRef(
    ({onEnter, value, onChange, onIncrement, onDecrement, step, ...props}: NumberProps,
        ref: React.RefObject<HTMLInputElement>) => {

    ref = ref ?? useRef<HTMLInputElement>();

    useEffect(() => {
        if (!ref.current)
            throw new Error("NumberInputField.useEffect failed: ref.current is null");
        ref.current.addEventListener("keyup", function (evt) {
            if (evt.key === "Escape" || evt.key === "Enter")
                ref.current!.blur();
            
            if (evt.key == "Enter" && onEnter)
                onEnter(evt);
        });
    }, [ref]);

    /*
     * TODO need to ensure user cannot type in invalid input
     */
    return  <div className="numberinputfield">
                <input ref={ref} type="number" value={value} onChange={onChange} {...props} />
                {!!step && <span>
                    <button onClick={() => onIncrement?.(step ?? 1)}>&and;</button>
                    <button onClick={() => onDecrement?.(step ?? 1)}>&or;</button>
                </span>}
            </div>
});
