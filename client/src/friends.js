import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    receiveFriendsAction,
    acceptFriendsAction,
    unfriendFriendsAction,
} from "./redux/friends-and-wannabes/slice.js";

import { Link } from "react-router-dom";
import "../friends.css";

export default function Friends() {
    const dispatch = useDispatch();
    /* const connections = useSelector((state) => state.friendsAndWannabes); */
    const friends = useSelector((state) => {
        console.log("state", state);
        return state.friendsAndWannabes.filter(({ accepted }) => accepted);
    });
    const wannabes = useSelector((state) => {
        return state.friendsAndWannabes.filter(({ accepted }) => !accepted);
    });
    console.log("friends", friends, wannabes);

    const onAccept = (otherUserId) => {
        const action = "Accept Request";

        fetch("/api/friendship-action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                otherUserId,
                action,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("success", data);
                dispatch(acceptFriendsAction(otherUserId));
                //dispatch
            })
            .catch((err) => {
                console.log("there's an error:", err);
            });
    };

    const onCancel = (otherUserId) => {
        const action = "Unfriend";

        fetch("/api/friendship-action", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                otherUserId,
                action,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("success", data);
                dispatch(unfriendFriendsAction(otherUserId));
                //dispatch
            })
            .catch((err) => {
                console.log("there's an error:", err);
            });
    };

    useEffect(() => {
        let abort = false;

        fetch(`/api/connections`)
            .then((res) => res.json())
            .then((data) => {
                console.log("friendsandWannabees array", data);
                if (!abort) {
                    dispatch(receiveFriendsAction(data));
                }
            })
            .catch((err) => {
                console.log("error getting a selected profile", err);
            });

        return () => {
            abort = true;
        };
    }, []);
    console.log("friends", friends);
    return (
        <div id="friends">
            <div className="friends">
                <h2>Friends</h2>
                {friends.map((friend) => {
                    return (
                        <div key={friend.id} className="result">
                            <img src={friend.profile_picture_url} />
                            <Link to={`/user/${friend.id}`}>
                                <p>
                                    {friend.first} {friend.last}
                                </p>
                            </Link>
                            <button onClick={() => onCancel(friend.id)}>
                                Unfriend
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="pending">
                <h2>Pending Requests</h2>
                {wannabes.map((friend) => {
                    return (
                        <div key={friend.id} className="result">
                            <img src={friend.profile_picture_url} />
                            <Link to={`/user/${friend.id}`}>
                                <p>
                                    {friend.first} {friend.last}
                                </p>
                            </Link>
                            <button onClick={() => onAccept(friend.id)}>
                                Accept
                            </button>
                            <button onClick={() => onCancel(friend.id)}>
                                Ignore
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
