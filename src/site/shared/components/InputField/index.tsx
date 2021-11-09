
   
import { useEffect, useRef } from "react"



type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {

}
export const InputField = (props: Props) => {
    const ref = useRef<HTMLInputElement>();

    useEffect(() => {
        ref.current.addEventListener("keydown", function(evt) {
            if (evt.key === "Escape") {
                ref.current.blur();
            }
        });
    }, [ref]);

    return <input ref={ref}
                  {...props} />
}