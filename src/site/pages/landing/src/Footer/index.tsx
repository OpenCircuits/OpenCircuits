import {AUTHORS_URL, DIGITAL_URL, DOCS_URL, GITHUB_URL} from "../Constants";


export const Footer = () => (
    <footer className="pt-4 my-md-5 pt-md-5 border-top">
        <div className="row">
            <div className="col-12 col-md">
                <img className="mb-1" src="img/icon.svg" alt="" width="48" height="48" />
                <small className="d-block mb-3 text-muted">© 2017-{new Date().getFullYear()}</small>
            </div>
            <div className="col-6 col-md">
                <h5>Simulators</h5>
                <ul className="list-unstyled text-small">
                    <li><a className="text-muted" href={DIGITAL_URL}>OpenCircuits</a></li>
                    <li><a className="text-muted disabled" href="/">OpenCircuits EE</a></li>
                </ul>
            </div>
            <div className="col-6 col-md">
                <h5>Resources</h5>
                <ul className="list-unstyled text-small">
                    <li><a className="text-muted disabled" href="/">Learn</a></li>
                    <li><a className="text-muted disabled" href="/">Examples</a></li>
                    <li>
                        <a className="text-muted" href={DOCS_URL} target="_blank" rel="noreferrer">Documentation</a>
                    </li>
                    <li>
                        <a className="text-muted" href={GITHUB_URL} target="_blank" rel="noreferrer">Contribute</a>
                    </li>
                </ul>
            </div>
            <div className="col-6 col-md">
                <h5>About</h5>
                <ul className="list-unstyled text-small">
                    <li><a className="text-muted" href={AUTHORS_URL} target="_blank" rel="noreferrer">Team</a></li>
                    <li><a className="text-muted disabled" href="/">Privacy</a></li>
                    <li><a className="text-muted disabled" href="/">Terms</a></li>
                </ul>
            </div>
        </div>
    </footer>
);
