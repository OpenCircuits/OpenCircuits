import {DIGITAL_URL, GITHUB_URL} from "../Constants";


export const Header = () => (
    <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 border-bottom box-shadow">
        <h5 className="my-0 mr-md-auto font-weight-normal">
            <a className="navbar-brand" href="/">
                <img src="img/icon.svg" alt="Opencircuits icon" height="80px"
                     style={{ marginTop: "-20px", marginBottom: "-20px" }} />
            </a>
        </h5>
        <a className="btn btn-outline-success me-3 header-simulator-btn" href={DIGITAL_URL}>Simulator</a>
        <nav className="my-2 my-md-0">
            <a className="p-2 text-dark disabled" href="/">Learn</a>
            <a className="p-2 text-dark disabled" href="/">Examples</a>
            <a className="p-2 text-dark disabled" href="/">Contribute</a>
            <a className="p-2 text-dark disabled" href="/">About</a>
            <a className="btn btn-outline-primary ms-3 disabled" href="/">Sign up</a>
        </nav>
        <a className="ms-auto" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <img src="img/github.svg" alt="Github logo" />
        </a>
    </div>
);
