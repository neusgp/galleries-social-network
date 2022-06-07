import { Component } from "react";
import "../bioeditor.css";

export default class BioEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bio: props.userbio,
            onBioUpdate: props.onBioUpdate,
            editmode: false,
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }
    onCancel() {
        this.setState({
            editmode: false,
        });
    }

    onEditClick() {
        this.setState({
            editmode: true,
        });
    }
    onSubmit(e) {
        e.preventDefault();
        console.log("old bio", this.props.userbio);
        this.setState(
            {
                bio: e.target.editbio.value,
            },
            () => {
                console.log("new bio", this.state.bio);
                fetch("/api/users/bio", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.state),
                })
                    .then((res) => res.json())
                    .then((data) => {
                        console.log("success uploading bio", data);
                        this.setState({
                            editmode: false,
                            bio: data[0].bio,
                        });
                        this.state.onBioUpdate(data[0].bio);
                    })
                    .catch((err) => {
                        console.log("err uploading new bio", err);
                    });
            }
        );
    }
    render() {
        return (
            <div id="bioeditor">
                {this.state.editmode ? (
                    <form onSubmit={this.onSubmit}>
                        <textarea
                            name="editbio"
                            defaultValue={this.props.userbio}
                        ></textarea>
                        <button className="savebutton">Save</button>
                        <button onClick={this.onCancel}>Cancel</button>
                    </form>
                ) : (
                    <>
                        <div className="bio">
                            {" "}
                            <p>{this.props.userbio}</p>
                        </div>
                        {this.props.userbio ? (
                            <button onClick={this.onEditClick}>Edit Bio</button>
                        ) : (
                            <button onClick={this.onEditClick}>Add Bio</button>
                        )}
                    </>
                )}
            </div>
        );
    }
}
