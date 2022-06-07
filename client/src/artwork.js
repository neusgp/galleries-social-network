import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router";

import "../artwork.css";

export default function Artwork() {
    const [artwork, setArtwork] = useState({});

    const { artworkId } = useParams();
    const [err, setErr] = useState("");
    const history = useHistory();
    console.log("history:", history);

    useEffect(() => {
        let abort = false;

        console.log(
            "the artwork we want to request information for is:",
            artworkId
        );

        fetch(`https://api.artic.edu/api/v1/artworks/${artworkId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("data for artwork", data);
                if (!abort) {
                    setArtwork(data.data);
                    return;
                }
                history.push("/");
            })
            .catch((err) => {
                console.log("error getting a selected artwork", err);
                setErr(err);
            });

        return () => {
            abort = true;
        };
    }, [artworkId]);

    return (
        <div id="artwork">
            <img
                src={`https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`}
                /* alt={artwork.thumbnail.alt_text} */
            />
            {/*  <FriendButton props={otherUserId} /> */}

            <div className="artworkinfo">
                <h1>{artwork.title}</h1>
                <h3>
                    {artwork.artist_title}, {artwork.date_display}
                </h3>
                <p className="description">{artwork.medium_display}</p>

                <AddButton artwork={artwork} artworkId={artworkId} />
            </div>

            {err && <h2>could not find user! :</h2>}
        </div>
    );
}

function AddButton(props) {
    console.log("im passing these props", props);
    const artwork = props.artwork;
    const artworkId = props.artworkId;

    const [buttonText, setButtonText] = useState("");

    const onClick = (e) => {
        const action = e.target.textContent;
        const url = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`;

        const work = {
            artworkId: artworkId,
            title: artwork.title,
            artist: artwork.artist_title,
            date: artwork.date_display,
            description: artwork.medium_display,
            url: url,
        };

        console.log(action);
        fetch("/api/artwork-action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ work, action }),
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
        fetch(`/api/artwork-status/${artworkId}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("data of gallery status", data);
                if (!abort) {
                    if (!data.result) {
                        setButtonText("Add to gallery");
                        return;
                    }
                    if (data.result) {
                        setButtonText("Remove from gallery");
                        return;
                    }
                }
            })
            .catch((err) => {
                console.log("error getting gallery data", err);
            });
        return () => {
            abort = true;
        };
    }, [artworkId, buttonText]);

    return (
        <div id="friendshipbuttons">
            <button onClick={onClick}>{buttonText}</button>
        </div>
    );
}
