import { Component } from "react";
import { Link } from "react-router-dom";
import "../resetpassword.css";

export default class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            step: 1,
            email: "",
            password: "",
            code: "",
        };
        this.onInput = this.onInput.bind(this);
        this.onSubmitStepOne = this.onSubmitStepOne.bind(this);
        this.onSubmitStepTwo = this.onSubmitStepTwo.bind(this);
    }

    onInput(e) {
        this.setState(
            {
                [e.target.name]: e.target.value,
            },
            () => console.log(this.state)
        );
    }

    onSubmitStepOne(e) {
        e.preventDefault();
        console.log("USER TRIED TO RESET PW");
        fetch("/api/password", {
            method: "POST",
            body: JSON.stringify(this.state),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            console.log("status", response.status);
            response
                .json()
                .then((data) => {
                    console.log("success, data", data);
                    this.setState({ step: 2 });
                })
                .catch((err) => {
                    console.log("error fetching code", err);
                });
        });
    }
    onSubmitStepTwo(e) {
        e.preventDefault();
        console.log("USER PUTS CODE");
        fetch("/api/password", {
            method: "PUT",
            body: JSON.stringify(this.state),
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            console.log("status", response.status);
            response
                .json()
                .then((data) => {
                    console.log("success, data", data);
                    this.setState({ step: 3 });
                })
                .catch((err) => {
                    console.log("error fetching code", err);
                });
        });
    }
    renderStepOne() {
        return (
            <form onSubmit={this.onSubmitStepOne}>
                <h3>Step 1</h3>
                <p>Please, enter your email adress:</p>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email"
                    onInput={this.onInput}
                />
                <button>Submit</button>
            </form>
        );
    }
    renderStepTwo() {
        return (
            <form onSubmit={this.onSubmitStepTwo}>
                <h3>Step 2</h3>
                <p>Please, enter the code you received:</p>
                <input
                    name="code"
                    type="text"
                    required
                    placeholder="Code"
                    onInput={this.onInput}
                />
                <p>And now, a new password:</p>
                <input
                    name="password"
                    type="password"
                    required
                    placeholder="New password"
                    onInput={this.onInput}
                />
                <button>Submit</button>
            </form>
        );
    }
    renderStepThree() {
        return (
            <div>
                <h2>Reset password success! - step 3</h2>
                <p>
                    You can now <Link to="/login">Log in</Link>.
                </p>
            </div>
        );
    }
    renderStep() {
        /*eslint indent: [2, 4, {"SwitchCase": 1}]*/
        switch (this.state.step) {
            case 1:
                return this.renderStepOne();
            case 2:
                return this.renderStepTwo();
            case 3:
                return this.renderStepThree();
        }
    }
    render() {
        return (
            <div className="password-reset">
                <h2>Password reset</h2>
                {this.renderStep()}
                <p>{this.state.error}</p>
            </div>
        );
    }
}
