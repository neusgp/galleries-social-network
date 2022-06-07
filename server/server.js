const express = require("express");
const app = express();
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const cookieSession = require("cookie-session");
const db = require("../database/db.js");

const uidSafe = require("uid-safe");
const multer = require("multer");
const aws = require("aws-sdk");

const server = require("http").Server(app);

const cookieSessionMiddleware = cookieSession({
    secret: "...",
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true,
});

app.use(cookieSessionMiddleware);

const io = require("socket.io")(server, {
    allowRequest: (req, callback) =>
        callback(null, req.headers.referer.startsWith("http://localhost:3000")),
});

io.use((socket, next) =>
    cookieSessionMiddleware(socket.request, socket.request.res, next)
);

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-central-1",
});

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-central-1",
});

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, callback) => {
        uidSafe(24).then((randomId) => {
            const fileName = `${randomId}${path.extname(file.originalname)}`;
            callback(null, fileName);
        });
    },
});

const uploader = multer({
    storage: storage,
    limits: {
        fileSize: 2097152,
    },
});

app.use(compression());

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(express.static(path.join(__dirname, "..", "client", "public")));

// The cookie contains already a userId?

app.get("/user/id.json", (req, res) => {
    console.log(req.session);
    res.json({ userId: req.session.user_id });
});

//POST req to insert a new user

app.post("/", (req, res) => {
    console.log("POST request made to register page");

    const { first, last, email, password } = req.body;

    db.hashPassword(password)
        .then((password_hash) => {
            db.createUser(first, last, email, password_hash)
                .then(({ rows }) => {
                    console.log("new user: ", rows);

                    req.session.user_id = rows[0].id;
                    console.log("cookie :", req.session);

                    res.json({ success: true });
                })
                .catch((err) => {
                    console.log("registration error :", err);
                    res.json({ success: false });
                });
        })
        .catch((err) => {
            console.log("registration error :", err);
            res.json({ success: false });
        });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    let adress = req.body.email;
    let key = req.body.password;

    // Reject different type to avoid 1=1
    if (typeof adress != "string" || typeof key != "string") {
        res.send("Invalid parameters!");
        res.end();
        return;
    }

    db.login(email, password)
        .then((user) => {
            if (user) {
                console.log("user found!");
                req.session.user_id = user.id;
                console.log("cookie : ", req.session);
                res.json({ success: true });
                return;
            }
            console.log("user not found");
            console.log("cookie : ", req.session);
            //send an error message
            res.json({ success: false });
        })
        .catch((err) => {
            console.log("registration error :", err);
            //send an error message
            res.json({ success: false });
        });
});

//GET logout

app.get("/logout", async (req, res) => {
    req.session = null;
    console.log("LOGOUT, no session id");
    res.json({ success: true });
});

//reset password POST and PUT

app.post("/api/password", async (req, res) => {
    const { email } = req.body;

    function sendEmailWithCode(email, code) {
        console.log(
            "[social:email] sending email with email and code:",
            email,
            code
        );
        ses.sendEmail({
            Source: "Galleries <neuspiano@gmail.com>",
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Text: {
                        Data: `Here is the code you will need to reset your password: ${code}`,
                    },
                },
                Subject: {
                    Data: "Password Reset",
                },
            },
        })
            .promise()
            .then(() => console.log("it worked!"))
            .catch((err) => console.log(err));
    }

    const { rows } = await db.createPasswordCode(email);

    if (rows[0].email) {
        console.log("new code row", rows[0]);
        sendEmailWithCode(rows[0].email, rows[0].code);
        res.json({ success: true });
        return;
    }
    res.json({ success: false });
});

app.put("/api/password", async (req, res) => {
    const { email, code, password } = req.body;

    const result = await db.checkCode(code);
    console.log("result", result);
    if (result.success) {
        const password_hash = await db.hashPassword(password);
        console.log("password_h", password_hash);
        try {
            const { rows } = await db.updatePassword(email, password_hash);
            console.log("successs updating password", rows);
            res.json({ success: true });
        } catch (error) {
            console.log("error updating password ", error);
        }
    }
});

//GET all data from logged user

app.get("/api/users/me", async (req, res) => {
    if (!req.session.user_id) {
        return;
    }
    const { rows } = await db.getUserById(req.session.user_id);
    console.log("logged user data", rows[0]);
    res.json(rows[0]);
});

app.get("/api/artworks", async (req, res) => {
    console.log("AAAAAAAAAAAAA");
    try {
        const { rows } = await db.getArtworksById(req.session.user_id);
        console.log("found my artworks", rows);
        res.json(rows);
    } catch (error) {
        console.log("error gettin my artworks: ", error);
    }
});

//POST to upload image/new image

app.post("/api/profile_picture", uploader.single("image"), async (req, res) => {
    console.log("POST request to update/upload image");
    try {
        console.log("file:", req.file);
        console.log("input:", req.body);
        await awsUpload(req.file);
        console.log("PUT successful");
        console.log("filename", req.file.filename);
        let key = req.file.filename;

        let url =
            "https://mywatercolorimageboard.s3.eu-central-1.amazonaws.com/" +
            req.file.filename;

        const { rows } = await db.updatePic(req.session.user_id, key, url);
        console.log("new pic inserted:", rows);
        res.json(rows[0]);
    } catch (error) {
        console.log("error: ", error);
    }
});

//POST updating bio

app.post("/api/users/bio", async (req, res) => {
    const { bio } = req.body;
    console.log(req.body);

    try {
        console.log("this is the newbio", bio.newbio);
        const { rows } = await db.updateUserBio(bio, req.session.user_id);
        console.log("new bio inserted:", rows);
        res.json(rows);
    } catch (error) {
        console.log("error uploading bio server: ", error);
    }
});

//GET 3 most recent users

app.get("/users/recent.json", async (req, res) => {
    console.log("getting 3 most recent users");
    try {
        const { rows } = await db.getRecentUsers();
        console.log("3 most recent users: ", rows);
        res.json(rows);
    } catch (err) {
        console.log("error getting 3 recent users");
    }
});

//GET matching users

app.get("/users/search/:search", async (req, res) => {
    console.log("GET to get matching users");
    const { search } = req.params;
    try {
        const { rows } = await db.getMatchingUsers(search);
        console.log("foundUsers:", rows);
        res.json(rows);
    } catch (err) {
        console.log("error getting matchin users");
    }
});

//GET info of selected profile

app.get("/api/user/:otherUserId", async (req, res) => {
    console.log("GET REQUEST, info selected profile");

    const { otherUserId } = req.params;

    if (+otherUserId === req.session.user_id) {
        console.log("own profile required, redirecting");
        res.json({ redirect: true });
        return;
    }
    const { rows } = await db.getUserById(otherUserId);
    console.log("this is the selected profile", rows);
    res.json(rows[0]);
});

app.get("/api/friendship-status/:otherUserId", async (req, res) => {
    console.log("GET request to get frienship info");
    const userId = req.session.user_id;
    const { otherUserId } = req.params;
    console.log(userId, +otherUserId);

    try {
        const { rows } = await db.getFriendshipStatus(userId, +otherUserId);
        console.log("friendship status", rows);
        if (!rows[0]) {
            res.json({ noResult: true });
            return;
        }
        res.json(rows[0]);
    } catch (err) {
        console.log("error getting frienship status");
    }
});

app.post("/api/friendship-action", async (req, res) => {
    console.log("POST to manage friendship action");
    const { status, otherUserId, action } = req.body;
    console.log(status, otherUserId, action);
    try {
        if (action === "Make Friendship Request!") {
            await db.insertRequest(req.session.user_id, otherUserId);
            res.json({ text: "Cancel Request" });
            return;
        }
        if (
            action === "Cancel Request" ||
            action === "Unfriend" ||
            action === "Ignore"
        ) {
            await db.noFriendship(req.session.user_id, otherUserId);
            res.json({
                text: "Make Friendship Request!",
            });
            return;
        }
        if (action === "Accept Request") {
            await db.acceptRequest(req.session.user_id);
            res.json({ text: "Unfriend" });
            return;
        }
    } catch (err) {
        console.log("error managing friendships", err);
    }
});

app.get("/api/artworks/:otherUserId", async (req, res) => {
    console.log("GET request to get gallery other user");
    const { otherUserId } = req.params;
    console.log("server:", otherUserId);
    try {
        const { rows } = await db.getArtworksById(otherUserId);
        console.log("other user's artworks", rows);
        res.json(rows);
    } catch (err) {
        console.log("error getting other user's artworks");
    }
});

app.get("/api/artwork-status/:artworkId", async (req, res) => {
    console.log("GET request to get artwork info");
    const userId = req.session.user_id;
    const { artworkId } = req.params;
    console.log(artworkId);

    try {
        const { rows } = await db.getArtworkStatus(userId, artworkId);
        console.log("artwork status", rows);
        if (!rows[0]) {
            res.json({ result: false });
            return;
        }
        res.json({ result: true });
    } catch (err) {
        console.log("error getting artwork status");
    }
});

app.post("/api/artwork-action", async (req, res) => {
    console.log("POST to manage artwork action");
    const { work, action } = req.body;
    console.log(work, action);
    try {
        if (action === "Add to gallery") {
            await db.addToGallery(
                req.session.user_id,
                work.artworkId,
                work.url,
                work.title,
                work.artist,
                work.date,
                work.description
            );
            res.json({ text: "Remove from gallery" });
            return;
        }
        if (action === "Remove from gallery") {
            await db.removeFromGallery(req.session.user_id, work.artworkId);
            res.json({ text: "Add to gallery" });
            return;
        }
    } catch (err) {
        console.log("error managing artwork actions", err);
    }
});

app.get("/api/connections", async (req, res) => {
    console.log(req.session.user_id);
    const { rows } = await db.getConnections(req.session.user_id);
    console.log("conection rows", rows);
    res.json(rows);
});

app.get("/api/delete-account", async (req, res) => {
    console.log(
        "serv: request to delete profile. Sess_id:",
        req.session.user_id
    );
    try {
        const key = await db.getImageKey(req.session.user_id);

        deleteFromAws(key);
        console.log("image deleted from AWS");

        db.deleteAccount(req.session.user_id);
        console.log("serv: success");
        req.session = null;
        res.json({ success: true });
    } catch (err) {
        console.log("error getting frienship status");
    }
});

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

/* let presentUsers = {}; */

io.on("connection", async (socket) => {
    if (!socket.request.session.user_id) {
        return socket.disconnect(true);
    }

    //working on users online count

    console.log("Incoming socket connection", socket.id);
    // you can now access the session via socket as well
    const user_id = socket.request.session.user_id;
    console.log(user_id);

    /* presentUsers[socket.id] = userId; */

    const { rows } = await db.getChatMessages();
    const recentMessages = rows.reverse();
    console.log("recentMessages: ", recentMessages);
    socket.emit("recentMessages", recentMessages);

    socket.on("chatMessage", async (msg) => {
        console.log(user_id, msg);
        const { rows } = await db.createChatMessage(user_id, msg);
        const user = await db.getMessageUser(user_id);
        const join = [rows[0], ...user.rows];
        const data = { ...join[0], ...join[1] };
        console.log("rows", data);
        io.emit("message", data);
    });

    /*  socket.on("disconnect", function () {
        delete presentUsers{socket.id};
    }); */
});
function deleteFromAws(key) {
    var params = {
        Bucket: "mywatercolorimageboard",
        Key: `${key}`,
    };
    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log("error deleting pic", err.stack);
            return;
        }
        console.log(data); // successful response
    });
}

function awsUpload(req_file) {
    const promise = s3
        .putObject({
            Bucket: "mywatercolorimageboard",
            ACL: "public-read",
            Key: req_file.filename,
            Body: fs.createReadStream(req_file.path),
            ContentType: req_file.mimetype,
            ContentLength: req_file.size,
        })
        .promise();

    return promise
        .then(() => {
            console.log("File uploaded");
        })
        .catch((err) => {
            console.log("error uploading file");
            console.log(err);
        });
}

server.listen(process.env.PORT || 3001, function () {
    console.log("I'm listening.");
});
