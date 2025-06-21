"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.PlayerPosition = void 0;
var PlayerPosition;
(function (PlayerPosition) {
    PlayerPosition["FIELD"] = "field";
    PlayerPosition["GOALKEEPER"] = "goalkeeper";
})(PlayerPosition || (exports.PlayerPosition = PlayerPosition = {}));
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["ADMIN"] = "admin";
})(UserRole || (exports.UserRole = UserRole = {}));
