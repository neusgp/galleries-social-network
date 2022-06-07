import { useState } from "react";
import { useEffect } from "react";
import "../findpeople.css";
import { Link } from "react-router-dom";

export default function FoundPeople() {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState([]);

    const onSearch = (e) => {
        if (e.target.value) {
            setSearch(e.target.value);
            return;
        }
        setSearch(null);
        setUsers([]);
    };

    useEffect(() => {
        console.log("SEARCH TERM UPDATED", search);

        let abort = false;

        fetch(`/users/search/${search}`)
            .then((res) => res.json())
            .then((data) => {
                console.log("we found some users client! :", data);
                if (!abort) {
                    setUsers(data);
                }
            })
            .catch((err) => {
                console.log("error getting matching users", err);
            });

        return () => (abort = true);
    }, [search]);
    console.log("users", users);
    return (
        <div id="findusers">
            <div id="searchusers">
                <h1>Search Users</h1>
                <div className="separador"></div>
                <input onChange={onSearch} placeholder={"Search"} />
                {users.map((user) => {
                    console.log("users:", user);
                    return (
                        <div key={user.id} className="result">
                            <img src={user.profile_picture_url} />
                            <Link to={`/user/${user.id}`}>
                                <p>
                                    {user.first} {user.last}
                                </p>
                            </Link>
                        </div>
                    );
                })}
            </div>
            <RecentUsers />
        </div>
    );
}

function RecentUsers() {
    const [recentUsers, setrecentUsers] = useState([]);

    useEffect(() => {
        fetch(`/users/recent.json`)
            .then((res) => res.json())
            .then((data) => {
                console.log("we found 3 recent users:", data);
                setrecentUsers(data);
            })
            .catch((err) => {
                console.log("error getting 3 recent users", err);
            });
    }, []);

    return (
        /*   <BrowserRouter> */
        <div id="recentusers">
            <h1>Check who just joined our community:</h1>
            {recentUsers.map((user) => {
                console.log("users:", user);
                return (
                    <div key={user.id} className="user" /* onClick={onClick} */>
                        <img src={user.profile_picture_url} />
                        <p>
                            <Link to={`/user/${user.id}`}>
                                {user.first} {user.last}
                            </Link>
                        </p>
                    </div>
                );
            })}
        </div>
        /*  </BrowserRouter> */
    );
}
