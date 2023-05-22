"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function exclude(user, keys) {
    for (let key of keys) {
        delete user[key];
    }
    return user;
}
exports.default = exclude;
