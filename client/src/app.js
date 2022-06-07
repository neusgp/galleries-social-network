import { Component } from "react";
import { Route, Link } from "react-router-dom";
import BioEditor from "./bioeditor";
import FindPeople from "./findpeople";
import OtherProfile from "./otherprofile";
import Friends from "./friends";
import Chat from "./chat";
import ArtSearch from "./artsearch";
import DeleteAccount from "./deleteaccount";
import Artwork from "./artwork";
import MyArtworks from "./my-artworks";

import "../app.css";

export default class App extends Component {
    constructor() {
        super();
        this.state = {
            // the first three entries will come from the server
            first_name: "",
            last_name: "",
            profile_picture_url: "",
            bio: null,
            image: null,
            showModal: false,
        };
        this.onUpload = this.onUpload.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onProfileClick = this.onProfileClick.bind(this);
        this.onLogoutClick = this.onLogoutClick.bind(this);
        this.onBioUpdate = this.onBioUpdate.bind(this);
    }
    onLogoutClick() {
        fetch("/logout")
            .then((response) => response.json())
            .then((data) => {
                console.log("logout success", data);
                location.replace("/");
            })
            .catch((err) => {
                console.log("error logging out", err);
            });
    }
    onProfileClick() {
        this.setState({ showModal: true });
    }
    /*  onBackgroundClick() {
        this.
    } */
    handleFileChange(event) {
        console.log("Handle File Change");
        this.setState({ image: event.target.files[0] });
    }
    onUpload(new_profile_url) {
        this.setState({
            profile_picture_url: new_profile_url,
        });
        console.log("new pic url", this.state.profile_picture_url);
        this.closeModal();
    }
    closeModal() {
        this.setState({ showModal: false });
    }
    onBioUpdate(bio) {
        console.log("bio update! success passing function to the top!");
        this.setState({
            bio: bio,
        });
    }
    componentDidMount() {
        fetch("/api/users/me")
            .then((response) => response.json())
            .then((data) => {
                this.setState({
                    // this can be this.setState(data) of course
                    first_name: data.first,
                    last_name: data.last,
                    profile_picture_url: data.profile_picture_url,
                    bio: data.bio,
                });
            });
    }
    render() {
        return (
            <div id="app">
                <main className="container">
                    {this.state.showModal && (
                        <ProfilePictureModal
                            closeModal={this.closeModal}
                            handleFileChange={this.handleFileChange}
                            onUpload={this.onUpload}
                        />
                    )}
                    <Route exact path="/">
                        <Profile
                            first_name={this.state.first_name}
                            last_name={this.state.last_name}
                            profile_picture_url={this.state.profile_picture_url}
                            bio={this.state.bio}
                            onClick={this.onProfileClick}
                            onBioUpdate={this.onBioUpdate}
                        />

                        <DeleteAccount />
                    </Route>

                    <Route exact path="/users">
                        <FindPeople />
                    </Route>
                    <Route exact path="/user/:otherUserId">
                        <OtherProfile />
                    </Route>
                    <Route exact path="/friends">
                        <Friends />
                    </Route>
                    <Route exact path="/chat">
                        <Chat />
                    </Route>
                    <Route exact path="/artwork/:artworkId">
                        <Artwork />
                    </Route>
                </main>

                <footer>© Galleries 2022</footer>

                <header>
                    <img className="logo" src="../logo.png" />
                    <nav>
                        <p>
                            <Link to="/">Home</Link>
                        </p>
                        <p>
                            <Link to="/users">Find People</Link>
                        </p>
                        <p>
                            <Link to="/friends">Friends</Link>
                        </p>
                        <p>
                            <Link to="/chat">Chat</Link>
                        </p>
                    </nav>
                    <div className="artsearch">
                        <ArtSearch />
                    </div>
                    <div className="userindicator">
                        <p>Welcome back, {this.state.first_name}!</p>
                        {
                            <ProfilePicture
                                profile_picture_url={
                                    this.state.profile_picture_url
                                }
                                onClick={this.onProfileClick}
                                alt={this.state.first_name}
                            />
                        }
                        <i
                            className="fa-solid fa-right-from-bracket"
                            onClick={this.onLogoutClick}
                        ></i>
                    </div>
                </header>
            </div>
        );
    }
}

function ProfilePicture({ profile_picture_url, onClick, user_name }) {
    return <img src={profile_picture_url} onClick={onClick} alt={user_name} />;
}

function ProfilePictureModal({ closeModal, onUpload }) {
    function onSubmit(event) {
        event.preventDefault();
        console.log("USER SUBMITTED NEW PIC");
        fetch("/api/profile_picture", {
            method: "POST",
            body: new FormData(event.target),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                onUpload(data.profile_picture_url);
            })
            .catch((err) => {
                console.log("err uploading new pic", err);
                // if something goes wrong => render an error
            }); // on success, call onUpload with the right parameter
    }
    return (
        <div id="picturemodal">
            <button className="close" onClick={closeModal}>
                &times;
            </button>
            <div className="modal-content">
                <h2>Upload profile picture</h2>
                <form onSubmit={onSubmit}>
                    <input type="file" required name="image" />
                    <button>Upload</button>
                </form>
            </div>
        </div>
    );
}

function Profile({
    first_name,
    last_name,
    profile_picture_url,
    bio,
    onClick,
    onBioUpdate,
}) {
    return (
        <div id="profile">
            <div className="mainInfo">
                {
                    <ProfilePicture
                        profile_picture_url={profile_picture_url}
                        onClick={onClick}
                        alt={first_name}
                    />
                }
                <div className="profileinfo">
                    <h2>
                        {first_name} {last_name}
                    </h2>
                    <h3>Bio</h3>
                    {<BioEditor userbio={bio} onBioUpdate={onBioUpdate} />}
                </div>
            </div>

            <MyArtworks />
        </div>
    );
}
