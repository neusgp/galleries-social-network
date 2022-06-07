import { BrowserRouter, Route, Link } from "react-router-dom";
import Registration from "./registration";
import Login from "./login";
import ResetPassword from "./resetpassword";
import "../welcome.css";

export default function Welcome() {
    return (
        <BrowserRouter>
            <div id="welcome">
                <header>
                    <p>
                        <Link to="/">Register</Link>
                    </p>
                    <p>
                        <Link to="/login">Login</Link>
                    </p>
                </header>

                <div className="maincontent">
                    <img src="../logo.png" />
                    <div className="title">
                        <h1>Welcome to Galleries!</h1>
                        <p>Build and share your art gallery!</p>
                    </div>
                    {/* <img src="/logo.png" /> */}

                    <div className="component">
                        <Route exact path="/">
                            <Registration />
                        </Route>
                        <Route path="/login">
                            <Login />
                        </Route>
                        <Route path="/reset-password">
                            <ResetPassword />
                        </Route>
                    </div>
                </div>

                <footer>
                    <p>© Galleries 2022</p>
                </footer>
            </div>
        </BrowserRouter>
    );
}
