import {Footer} from "../Footer";
import {Header} from "../Header";
import {Main}   from "../Main";

import "./index.scss";


export const App = () => (<>
    <Header />

    <Main />

    <div className="container">
        <Footer />
    </div>
</>);
