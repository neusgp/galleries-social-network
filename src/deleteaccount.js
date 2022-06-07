import { useState, useEffect } from "react";
import "../deleteaccount.css";

export default function DeleteAccount() {
    const [showModal, setShowModal] = useState(false);

    const onDeleteClick = () => {
        setShowModal(true);
    };
    const onAcceptClick = () => {
        setShowModal(false);
        fetch("/api/delete-account")
            .then((res) => res.json())
            .then((data) => {
                console.log("did we delete the account?", data);
                location.replace("/");
            })
            .catch((err) => {
                console.log("error deleting", err);
            });
    };

    const onCancel = () => {
        setShowModal(false);
    };

    useEffect(() => {
        console.log("we clicked the modal?");
    }, []);

    return (
        <div id="deleteIdButton">
            {showModal ? (
                <div className="deleteAccount">
                    <p>Are you sure you want to delete the account?</p>
                    <button onClick={onAcceptClick}>Yes</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
            ) : (
                <button onClick={onDeleteClick}>Delete Acount</button>
            )}
        </div>
    );
}
