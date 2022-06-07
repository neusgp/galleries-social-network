export function friendsAndWannabesReducer(state = [], action) {
    /*   console.log("action", action); */

    if (action.type == "friendsAndWannabes/receive") {
        return action.payload;
    }

    if (action.type == "friendsAndWannabes/accept") {
        console.log("payload", action.payload, state);
        return state.map((x) => {
            return {
                ...x,
                accepted: x.accepted || x.sender_id === action.payload,
            };
        });
    }
    if (action.type == "friendsAndWannabes/unfriend") {
        console.log("payload", action.payload, state);
        return state.filter(
            (x) =>
                action.payload !== x.sender_id &&
                action.payload !== x.recipient_id
        );
    }
    return state;
}

// ACTION CREATORS -----------------------------------
// Your action creators go here

export function receiveFriendsAction(newFriendsArray) {
    return {
        type: "friendsAndWannabes/receive",
        payload: newFriendsArray,
    };
}
export function acceptFriendsAction(id) {
    return {
        type: "friendsAndWannabes/accept",
        payload: id,
    };
}
export function unfriendFriendsAction(id) {
    return {
        type: "friendsAndWannabes/unfriend",
        payload: id,
    };
}
