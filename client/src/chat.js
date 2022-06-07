import { useState, useEffect, useRef } from "react";
import "../chat.css";
import io from "socket.io-client";

let socket;

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [inputVal, setInputVal] = useState("");
    const elemRef = useRef();
    /* const [msg, setMsg] = useState(""); */

    const handleChange = (e) => {
        console.log(e.target.value);
        setInputVal(e.target.value);
    };

    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return `, on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
    }

    useEffect(() => {
        if (!socket) {
            socket = io.connect();
        }
        // here we are sure that socket is connected

        //listen to the recent messages event, update the state accordingly
        socket.on("recentMessages", (data) => {
            console.log("recent messages (client side) ", data);
            if (data[0]) {
                setMessages(data);
                elemRef.current.scrollIntoView({
                    behavior: "smooth",
                });
            }
        });

        return () => {
            socket.off("message");
            socket.disconnect();
            socket = null;
        };
    }, []);

    useEffect(() => {
        socket.on("message", (data) => {
            console.log("new message: ", data);
            setMessages([...messages, data]);
            console.log("array of messages", [...messages, data]);
            elemRef.current.scrollIntoView({
                behavior: "instant",
            });
        });
    }, [messages]);

    function onSubmit(event) {
        // emit the "whisper" event
        event.preventDefault();
        socket.emit("chatMessage", inputVal);
    }

    return (
        <section id="chat">
            <h2>Chat</h2>

            <div className="messages">
                {messages.map((msg) => {
                    return (
                        <div key={msg.id} className="message" ref={elemRef}>
                            <p className="msgInfo">
                                {msg.first}
                                <time>{formatDate(msg.created_at)}</time>
                            </p>
                            <p className="msgText">{msg.text}</p>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={onSubmit}>
                <input
                    onChange={handleChange}
                    type="text"
                    name="message"
                    placeholder="Write your message..."
                />
                <button>Send</button>
            </form>
        </section>
    );
}
