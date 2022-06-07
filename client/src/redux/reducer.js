import { combineReducers } from "redux";
import { friendsAndWannabesReducer } from "./friends-and-wannabes/slice.js";

const rootReducer = combineReducers({
    friendsAndWannabes: friendsAndWannabesReducer,
});

export default rootReducer;
