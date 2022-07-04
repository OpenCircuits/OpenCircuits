import {useState} from "react";


type Sim = "digital" | "analog";


export const Main = () => {
    const [sim, setSim] = useState<Sim>("digital");

    return (<>
        <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-left">
            <h1 className="display-4">Build and simulate digital circuits</h1>
            <p className="lead">
                Quickly build and test digital circuitry with an easy-to-use, online, and completely free interface!
            </p>
        </div>

        <div className="container-fluid circuit-launch-wrapper mb-5">
            <button type="button"
                    className={`btn btn-outline-dark py-1 px-0 circuit-launch-wrapper-btn-1
                           ${sim === "digital" ? "circuit-launch-wrapper-btn-selected" : ""}`}
                    onClick={() => setSim("digital")}>
                <img src="img/digital-logo.svg" alt="Digital Logo" />
            </button>
            <button type="button"
                    className={`btn btn-outline-dark py-1 px-0 circuit-launch-wrapper-btn-2
                           ${sim === "analog" ? "circuit-launch-wrapper-btn-selected" : ""}`}
                    onClick={() => setSim("analog")}>
                <img src="img/analog-logo.svg" alt="Analog Logo" />
            </button>

            <div className="circuit-launch-wrapper-wire1"></div>
            <div className="circuit-launch-wrapper-wire2"></div>
            <div className="circuit-launch-wrapper-wire3"></div>

            <div className="circuit-launch-wrapper-output-div">
                <div className={`card text-center h-100 ${sim === "digital" ? "" : "d-none"}`}>
                    <img className="card-img-top p-2" src="img/digital-logo.svg" alt="Digital Logo" />
                    <div className="card-body p-2">
                        <p className="card-text font-weight-light">
                            The original OpenCircuits with entirely digital components.
                        </p>
                        <div className="extra-info p-1">
                            <img src="img/example2.png" alt="Example circuit" />
                        </div>
                        <a href="../" className="btn btn-success">Launch Simulator</a>
                    </div>
                </div>
                <div className={`card text-center h-100 ${sim === "analog" ? "" : "d-none"}`}>
                    <img className="card-img-top p-2" src="img/analog-logo.svg" alt="Analog Logo" />
                    <div className="card-body p-2">
                        <p className="card-text font-weight-light">
                            The new, in progress, OpenCircuits EE with analog components.
                        </p>
                        <a href="/analog" className="btn btn-success btn disabled">Coming Soon...</a>
                    </div>
                </div>
            </div>

            <img className="circuit-launch-wrapper-gate" src="img/xorgate.svg" alt="XOR Gate" />
        </div>
    </>);
}
