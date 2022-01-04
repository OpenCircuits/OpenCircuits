import {MutableRefObject, useEffect, useRef} from "react"


type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    onEnter?: (e: KeyboardEvent) => void;
}
export const InputField = (props: Props) => {
    const ref = useRef<HTMLInputElement>() as MutableRefObject<HTMLInputElement>;

    useEffect(() => {
        ref.current.addEventListener("keyup", function(evt) {
            if (evt.key === "Escape" || evt.key === "Enter")
                ref.current.blur();

            if (evt.key === "Enter" && props.onEnter)
                props.onEnter(evt);
        });
    }, [ref]);

    return <input ref={ref} {...props} />
}