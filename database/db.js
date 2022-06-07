const bcrypt = require("bcryptjs");
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/socialnetwork");
const cryptoRandomString = require("crypto-random-string");

module.exports.createUser = (first, last, email, password_hash) => {
    const query = `INSERT INTO users (first, last, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *`;

    const params = [first, last, email, password_hash];
    return db.query(query, params);
};

module.exports.hashPassword = (password) => {
    console.log("we are in db hash");
    return bcrypt
        .genSalt()
        .then((salt) => {
            return bcrypt.hash(password, salt);
        })
        .catch((err) => {
            console.log("bitcrypt err", err);
        });
};

module.exports.login = (email, password) => {
    return getUserByEmail(email).then(({ rows }) => {
        if (!rows[0]) {
            return false;
        }
        const user = rows[0];
        return comparePassword(password, user.password_hash).then((match) => {
            if (match) {
                return user;
            }
            return false;
        });
    });
};

module.exports.createPasswordCode = (email) => {
    const code = cryptoRandomString({ length: 6 });
    console.log("new code:", code);

    const query = `INSERT INTO password_reset_codes (code, email) VALUES ($1, $2) RETURNING *`;
    const params = [code, email];

    return db.query(query, params);
};

module.exports.checkCode = (code) => {
    return db
        .query("SELECT email FROM password_reset_codes WHERE code=$1", [code])
        .then(({ rows }) => {
            console.log(rows[0].email);
            if (rows[0].email) {
                console.log("found email with code :", rows[0].email);
                return { success: true };
            }
            console.log("success");
        })
        .catch((err) => {
            console.log("error checking code", err);
        });
};

module.exports.updatePassword = (email, password_hash) => {
    const query = `UPDATE users SET password_hash=$2 WHERE email=$1 RETURNING *`;
    const params = [email, password_hash];

    return db.query(query, params);
};

module.exports.getUserById = (user_id) => {
    const query = `SELECT * FROM users WHERE id=$1`;
    const params = [user_id];
    return db.query(query, params);
};

module.exports.getArtworksById = (id) => {
    return db.query("SELECT * FROM artworks WHERE user_id=$1;", [id]);
};

module.exports.updatePic = (user_id, key, url) => {
    return db.query(
        "UPDATE users SET profile_picture_key=$2, profile_picture_url=$3 WHERE id=$1 RETURNING *;",
        [user_id, key, url]
    );
};

module.exports.getImageKey = (user_id) => {
    return db.query("SELECT profile_picture_key FROM users WHERE id=$1;", [
        user_id,
    ]);
};

module.exports.updateUserBio = (bio, user_id) => {
    const query = `UPDATE users SET bio=$1 WHERE id=$2 RETURNING *`;
    const params = [bio, user_id];

    return db.query(query, params);
};

module.exports.getRecentUsers = () => {
    return db.query(
        "SELECT first, last, profile_picture_url, id FROM users ORDER BY id DESC LIMIT 3;"
    );
};

module.exports.getMatchingUsers = (val) => {
    return db.query(
        "SELECT first, last, profile_picture_url, id FROM users WHERE first ILIKE $1 LIMIT 8;",
        [val + "%"]
    );
};

module.exports.getFriendshipStatus = (user_id, otherUserId) => {
    return db.query(
        "SELECT * FROM friendships WHERE (recipient_id=$1 AND sender_id=$2) OR (recipient_id=$2 AND sender_id=$1);",
        [user_id, otherUserId]
    );
};

module.exports.getArtworkStatus = (user_id, artworkId) => {
    return db.query(
        "SELECT * FROM artworks WHERE artworks.user_id=$1 AND artworks.artwork_id=$2;",
        [user_id, artworkId]
    );
};

module.exports.addToGallery = (
    user_id,
    artwork_id,
    url,
    title,
    artist,
    date,
    description
) => {
    return db.query(
        "INSERT INTO artworks (user_id, artwork_id, url, title, artist, date, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [user_id, artwork_id, url, title, artist, date, description]
    );
};

module.exports.removeFromGallery = (user_id, artworkId) => {
    console.log("im inside db");
    return db.query(
        `DELETE FROM artworks WHERE (user_id=$1 AND artwork_id=$2)`,
        [user_id, artworkId]
    );
};

module.exports.insertRequest = (user_id, otherUserId) => {
    return db.query(
        "INSERT INTO friendships (sender_id, recipient_id) VALUES ($1, $2);",
        [user_id, otherUserId]
    );
};

module.exports.acceptRequest = (user_id) => {
    return db.query(
        "UPDATE friendships SET accepted=true WHERE recipient_id=$1;",
        [user_id]
    );
};

module.exports.noFriendship = (user_id, otherUserId) => {
    return db.query(
        "DELETE FROM friendships WHERE (recipient_id=$1 AND sender_id=$2) OR (recipient_id=$2 AND sender_id=$1);",
        [user_id, otherUserId]
    );
};

module.exports.getConnections = (user_id) => {
    return db.query(
        `SELECT users.id, first, last, profile_picture_url, accepted, sender_id
        FROM users
        JOIN friendships
        ON (accepted = false AND recipient_id = $1 AND sender_id = users.id)
        OR (accepted = true AND recipient_id = $1 AND sender_id = users.id)
        OR (accepted = true AND sender_id = $1 AND recipient_id = users.id);`,
        [user_id]
    );
};

module.exports.getChatMessages = () => {
    return db.query(
        "SELECT * FROM users INNER JOIN chat_messages ON users.id=chat_messages.sender_id ORDER BY chat_messages.created_at DESC LIMIT 10;"
    );
};

module.exports.createChatMessage = (user_id, text) => {
    return db.query(
        "INSERT INTO chat_messages (sender_id, text) VALUES ($1, $2) RETURNING *;",
        [user_id, text]
    );
};

module.exports.getMessageUser = (user_id) => {
    return db.query(
        "SELECT first, last, profile_picture_url FROM users WHERE users.id=$1",
        [user_id]
    );
};

module.exports.deleteAccount = (user_id) => {
    return db.query("DELETE FROM users WHERE id=$1;", [user_id]);
};

const getUserByEmail = (email) => {
    const query = `SELECT * FROM users WHERE email=$1`;
    const params = [email];
    return db.query(query, params);
};

const comparePassword = (password, password_hash) => {
    return bcrypt.compare(password, password_hash);
};
