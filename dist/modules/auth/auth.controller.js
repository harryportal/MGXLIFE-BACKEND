"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("./auth.service"));
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.authService = new auth_service_1.default();
AuthController.signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _b = req.body, { referringId } = _b, userData = __rest(_b, ["referringId"]);
    const distributor = yield _a.authService.createDistributor(userData, referringId);
    return res.status(201).json({ success: true, data: distributor });
});
AuthController.resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { password, confirmPassword, token } = req.body;
    yield _a.authService.resetPassword(token, password, confirmPassword);
    return res.status(200).json({ success: true, message: "success" });
});
AuthController.getAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.query.token;
    const accessToken = yield _a.authService.getAccessToken(refreshToken);
    return res.json({ success: true, data: { accessToken } });
});
AuthController.getVerificationMail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, email } = req.user;
    yield _a.authService.sendVerificationMail(firstname, email);
    return res.status(200).json({ success: true, message: "Check Your Email for Verification!" });
});
AuthController.deleteRefreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.query.token;
    yield _a.authService.deleteRefreshToken(refreshToken);
    return res.status(204);
});
AuthController.verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationToken = req.query.token;
    yield _a.authService.verifyEmail(verificationToken);
    return res.status(200).json({ success: true, message: "Email has been verified" });
});
AuthController.SignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = yield _a.authService.signIn(email, password);
    return res.json({ success: true, data: { refreshToken, accessToken } });
});
AuthController.forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.query.email;
    yield _a.authService.forgotPassword(email);
    return res.json({ success: true, message: "Check Your Inbox!" });
});
