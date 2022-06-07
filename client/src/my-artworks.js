import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import "../my-artworks.css";

export default function MyArtworks() {
    const [artworks, setArtworks] = useState([]);

    useEffect(() => {
        let abort = false;

        console.log("I want to get my artwoks!");

        fetch("/api/artworks")
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
            <h2>My Gallery</h2>
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
