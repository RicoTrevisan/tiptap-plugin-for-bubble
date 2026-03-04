const jsonwebtoken = require("jsonwebtoken");
const { inspect } = require("node:util");

let allowedDocumentNames = [];
if (properties.docNames) {
    allowedDocumentNames = properties.docNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

const data = {};
if (properties.sub) {
    data.sub = properties.sub;
}
if (allowedDocumentNames.length > 0) {
    data.allowedDocumentNames = allowedDocumentNames;
}

let key;
if (properties.jwt_secret === "Tiptap Cloud") key = context.keys["Tiptap Cloud JWT secret"];
if (properties.jwt_secret === "Custom") key = context.keys["Custom collab JWT secret"];
if (key) key = key.trim();

const expiration = properties.expiration || 86400;
const signOptions = { expiresIn: expiration };

if (properties.appId) {
    signOptions.audience = properties.appId;
}

try {
    const jwt = jsonwebtoken.sign(data, key, signOptions);

    return {
        jwt_key: jwt,
        error: "",
        returned_an_error: false,
    };
} catch (error) {
    console.log("error when creating JWT token", inspect(error));
    return {
        jwt_key: "",
        error: "there was an error retrieving the jwt keys.\n" + inspect(error),
        returned_an_error: true,
    };
}
