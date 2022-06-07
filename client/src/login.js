import { Component } from "react";
import { Link } from "react-router-dom";
import "../login.css";

export default class Login extends Component {
    constructor() {
        super();
        this.state = {
            error: false,
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => console.log(this.state)
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        console.log("USER TRIED TO LOGIN");
        fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(this.state),
        })
            .then((res) => res.json())
            .then((result) => {
                if (!result) {
                    console.log("theres no result");
                    //render an error
                    return;
                }
                // if all goes to plan, refresh the page
                /* location.reload(); */
                location.href = "/";
            })
            .catch((err) => {
                console.log("there's an error:", err);
                // if something goes wrong => render an error
            });
    }

    render() {
        return (
            <div id="login">
                <h1>Login</h1>
                {this.state.error && <p>Oops, something went wrong!</p>}
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.handleChange}
                        type="email"
                        name="email"
                        placeholder="Email Address"
                    />
                    <input
                        onChange={this.handleChange}
                        type="password"
                        name="password"
                        placeholder="Password"
                    />
                    <button>Submit</button>
                    <div className="links">
                        <p>
                            <Link to="/">Click here to Register!</Link>
                        </p>
                        <p>
                            <Link to="/reset-password">
                                I forgot the password...
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        );
    }
}
