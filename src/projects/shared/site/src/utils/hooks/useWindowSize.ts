import {useEffect, useState} from "react";


export const useWindowSize = () => {
    const getSize = () => ({
        w: window.innerWidth,
        h: window.innerHeight,
    });

    // Initialize state with initial window size
    const [size, setSize] = useState(getSize());

    useEffect(() => {
        // Function to call on window resize to update the state
        const onResize = () => setSize(getSize());

        // Add event listener
        window.addEventListener("resize", onResize);

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", onResize);
    }, []); // Empty array ensures that the effect is only run once

    return size;
}
