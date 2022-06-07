import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../artsearch.css";

export default function ArtSearch() {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [path, setPath] = useState("");
    const [isComponentVisible, setIsComponentVisible] = useState(true);
    const ref = useRef(null);

    const onBlur = (e) => {
        if (e.target.value) {
            e.target.value = null;
        }
    };

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            setIsComponentVisible(false);
            setSearch(null);
            setResults([]);
            setPath("");
        }
    };

    const onSearch = (e) => {
        if (e.target.value) {
            setSearch(e.target.value);
            setPath(
                `https://api.artic.edu/api/v1/artworks/search?q=${search}&fields=id,title,artist_display,date_display,main_reference_number,image_id`
            );

            return;
        }
        setSearch(null);
        setResults([]);
        setPath("");
    };
    useEffect(() => {
        console.log("SEARCH artwork TERM UPDATED:", search);
        setIsComponentVisible(true);

        let abort = false;
        document.addEventListener("click", handleClickOutside, true);

        fetch(path)
            .then((res) => res.json())
            .then((data) => {
                console.log("we found some results client! :", data.data);
                if (!abort) {
                    setResults(data.data);
                }
            })
            .catch((err) => {
                console.log("error getting matching users", err);
            });

        return () => (
            (abort = true),
            document.removeEventListener("click", handleClickOutside, true)
        );
    }, [path]);

    return (
        <div id="artsearch">
            <input
                onChange={onSearch}
                placeholder={"Search your artwork..."}
                onBlur={onBlur}
            />
            {results[0] && (
                <div className="resultsbox" ref={ref}>
                    {isComponentVisible && (
                        <>
                            {results.map((result) => {
                                console.log("result:", result);
                                return (
                                    <div key={result.id} className="result">
                                        <img
                                            src={`https://www.artic.edu/iiif/2/${result.image_id}/full/843,/0/default.jpg`}
                                        />
                                        <Link to={`/artwork/${result.id}`}>
                                            <p>{result.title}</p>
                                        </Link>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
