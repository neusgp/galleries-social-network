import { Component } from "react";
import { Link } from "react-router-dom";
import "../registration.css";

export default class Registration extends Component {
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
        console.log("USER TRIED TO SUBMIT");
        fetch("/", {
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
                location.reload();
            })
            .catch((err) => {
                console.log("there's an error:", err);
                // if something goes wrong => render an error
            });
    }

    render() {
        return (
            <div id="registration">
                <h1>Register</h1>
                {this.state.error && <p>Oops, something went wrong!</p>}
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.handleChange}
                        type="text"
                        name="first"
                        placeholder="First Name"
                    />
                    <input
                        onChange={this.handleChange}
                        type="text"
                        name="last"
                        placeholder="Last Name"
                    />
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
                    <p>
                        <Link to="/login">Click here to Log in!</Link>
                    </p>
                </form>
            </div>
        );
    }
}
