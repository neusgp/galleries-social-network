import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router";
import { Link } from "react-router-dom";
import "../otherprofile.css";

export default function OtherProfile() {
    const [profile, setProfile] = useState({});
    const { otherUserId } = useParams();
    const [err, setErr] = useState("");
    const [showGallery, setShowGallery] = useState(false);
    const history = useHistory();
    console.log("history:", history);

    const galleryOn = (val) => {
        setShowGallery(val);
    };

    useEffect(() => {
        let abort = false;
        console.log("otherProfile just rendered for the first time");
        console.log(
            "the if of user we want to request information for is:",
            otherUserId
        );
        console.log("typeof otherUserId", typeof otherUserId);
        // #2nd is make a request to fetch this data from the server

        fetch(`/api/user/${otherUserId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("data for other profile", data);
                if (!abort && !data.redirect) {
                    setProfile(data);
                    return;
                }
                history.push("/");
            })
            .catch((err) => {
                console.log("error getting a selected profile", err);
                setErr(err);
            });

        // #3.c the server tells us this is our own profile

        return () => {
            abort = true;
        };
    }, [otherUserId]);
    console.log("galleryON:", showGallery);
    return (
        <div id="otherprofile">
            <div className="mainInfo">
                <div className="picitems">
                    <img
                        src={profile.profile_picture_url}
                        alt={profile.first}
                    />
                    <FriendButton
                        otherUserId={otherUserId}
                        galleryOn={galleryOn}
                    />
                </div>
                <div className="profileinfo">
                    <h2>
                        {profile.first} {profile.last}
                    </h2>
                    <p className="bio">{profile.bio}</p>
                </div>
            </div>
            {err && <h2>could not find user! :(</h2>}
            {showGallery && (
                <OtherGallery profile={profile} otherUserId={otherUserId} />
            )}
        </div>
    );
}

function FriendButton(props) {
    console.log("im passing these props", props);
    const otherUserId = props.otherUserId;
    const [status, setStatus] = useState({});
    const [buttonText, setButtonText] = useState("");

    const onClick = (e) => {
        const action = e.target.textContent;
        console.log(action);
        fetch("/api/friendship-action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status,
                otherUserId,
                action,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("success", data);
                setButtonText(data.text);
            })
            .catch((err) => {
                console.log("there's an error:", err);
            });
    };

    useEffect(() => {
        let abort = false;
        fetch(`/api/friendship-status/${otherUserId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("data of friendships status", data);
                if (!abort) {
                    setStatus(data);
                    console.log("status", data);
                }
                if (data.noResult) {
                    setButtonText("Make Friendship Request!");
                    props.galleryOn(false);
                    return;
                }
                if (data.recipient_id === +otherUserId && !data.accepted) {
                    setButtonText("Cancel Request");
                    props.galleryOn(false);
                    return;
                }
                if (
                    (data.recipient_id === +otherUserId && data.accepted) ||
                    (data.sender_id === +otherUserId && data.accepted)
                ) {
                    setButtonText("Unfriend");
                    props.galleryOn(true);
                    return;
                }
                if (data.sender_id === +otherUserId && !data.accepted) {
                    setButtonText("Accept Request");
                    props.galleryOn(false);
                    return;
                }
            })
            .catch((err) => {
                console.log("error getting friendships data", err);
            });
        return () => {
            abort = true;
        };
    }, [otherUserId, buttonText]);

    return (
        <div id="friendshipbuttons">
            <button onClick={onClick}>{buttonText}</button>{" "}
        </div>
    );
}

function OtherGallery(props) {
    console.log("im passing these props", props);
    const otherUserId = props.otherUserId;

    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        let abort = false;

        console.log("I want to get my artwoks!");

        fetch(`/api/artworks/${otherUserId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("client: my artworks!", data);
                if (!abort) {
                    setArtworks(data);
                    return;
                }
            })
            .catch((err) => {
                console.log("error getting a selected artwork", err);
            });

        return () => {
            abort = true;
        };
    }, []);

    return (
        <div id="myartworks">
            <h2>Gallery</h2>
            <div className="decoration"></div>
            <div className="panel">
                {artworks.map((artwork) => {
                    return (
                        <div key={artwork.artwork_id} className="artwork">
                            <Link to={`/artwork/${artwork.artwork_id}`}>
                                {" "}
                                <img src={artwork.url} />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
