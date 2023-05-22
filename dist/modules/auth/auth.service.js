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
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_service_1 = __importDefault(require("../cloud/cloudinary.service"));
const shortid_1 = __importDefault(require("shortid"));
const auth_repositories_1 = __importDefault(require("./auth.repositories"));
const error_1 = require("../../common/error");
const jwt_1 = require("../../utils/jwtAuth/jwt");
const mail_service_1 = __importDefault(require("../mail/mail.service"));
const resetPassword_1 = require("../../utils/mailTemplates/resetPassword");
const completeProfile_1 = require("../../utils/mailTemplates/completeProfile");
class AuthService {
    constructor() {
        /* Logic for uploading the image */
        this.uploadImage = (imagepath) => __awaiter(this, void 0, void 0, function* () {
            if (!imagepath) {
                return "";
            }
            ;
            const { imageUrl } = yield this.cloudinaryService.uploadImage(imagepath);
            return imageUrl;
        });
        /* create the referal link using shortID and prepend the id with mg#.
        even though it will not be available to the user until subscription has been payed with stripe*/
        this.generateReferralLink = () => {
            const randomString = shortid_1.default.generate();
            return `mg#${randomString}`;
        };
        this.verifyEmail = (verificationToken) => __awaiter(this, void 0, void 0, function* () {
            const verifiedPayload = (0, jwt_1.verifyJWT)(verificationToken);
            if (verifiedPayload.type != "verify") {
                throw new error_1.BadRequestError("Please provide a valid verification token");
            }
            const { email } = verifiedPayload;
            yield this.authRepository.verifyDistributor(email);
        });
        this.signIn = (email, password) => __awaiter(this, void 0, void 0, function* () {
            const distributor = yield this.authRepository.getDistributor(email);
            if (!distributor) {
                throw new error_1.AuthError("Invalid Login Credentials");
            }
            const checkPassword = yield (0, jwt_1.comparePassword)(password, distributor.password);
            if (!checkPassword) {
                throw new error_1.AuthError("Invalid Login Credentials");
            }
            const accessToken = (0, jwt_1.createAcessToken)(distributor);
            const refreshToken = (0, jwt_1.createRefreshToken)(distributor);
            // creates a date 15 days from now.
            const refreshTokenExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
            this.authRepository.createRefreshToken(refreshToken, refreshTokenExpiresAt, distributor.id);
            return { accessToken, refreshToken };
        });
        this.resetPassword = (token, password, confirmPassword) => __awaiter(this, void 0, void 0, function* () {
            if (password !== confirmPassword) {
                throw new error_1.BadRequestError("Passwords do not match!");
            }
            let distributor = (0, jwt_1.verifyJWT)(token);
            const hashedPassword = yield (0, jwt_1.hashPassword)(password);
            yield this.authRepository.resetPassword(distributor.id, hashedPassword);
        });
        /* Deletes the refresh token from the database so it can not be further used to generate
        access tokens*/
        this.deleteRefreshToken = (refreshToken) => __awaiter(this, void 0, void 0, function* () {
            (0, jwt_1.verifyJWT)(refreshToken);
            yield this.authRepository.deleteRefreshToken(refreshToken);
        });
        this.getAccessToken = (refreshToken) => __awaiter(this, void 0, void 0, function* () {
            const verifiedPayload = (0, jwt_1.verifyJWT)(refreshToken);
            const token = yield this.authRepository.getRefreshToken(refreshToken);
            if (!token || token.expiresAt < new Date) {
                throw new error_1.AuthError("Invalid Refresh Token");
            }
            ;
            const email = verifiedPayload.email;
            const user = yield this.authRepository.getDistributor(email);
            const acessToken = (0, jwt_1.createAcessToken)(user);
            return acessToken;
        });
        this.createDistributor = (distributorData, refferalId) => __awaiter(this, void 0, void 0, function* () {
            let { email, password } = distributorData;
            const checkEmail = yield this.authRepository.getDistributor(email);
            if (checkEmail) {
                throw new error_1.AuthError("Email Already Exists!. Please use another Email Address");
            }
            const refferingId = this.generateReferralLink();
            distributorData.referringId = refferingId;
            distributorData.password = yield (0, jwt_1.hashPassword)(password);
            let distributor;
            if (refferalId) {
                // first check if a distributor with that referal id exist
                yield this.verifyReferralId(refferalId);
                distributor = yield this.authRepository.createDistributorwithReferral(distributorData, refferalId);
            }
            else {
                distributor = yield this.authRepository.createDistributorwithoutReferral(distributorData);
            }
            yield this.sendVerificationMail(distributor.firstName, distributor.email);
            distributor = this.removePassword(distributor);
            return distributor;
        });
        this.verifyReferralId = (refferingId) => __awaiter(this, void 0, void 0, function* () {
            const distributor = yield this.authRepository.getDistributorwithReferalId(refferingId);
            if (!distributor) {
                throw new error_1.BadRequestError("No Distributor with the referral Id provided");
            }
        });
        this.sendVerificationMail = (firstname, email) => __awaiter(this, void 0, void 0, function* () {
            const verificationToken = (0, jwt_1.createVerificationToken)(email);
            const verifyEmailUrl = `${process.env.FRONTENDURL}/verifyemail/?token=${verificationToken}`;
            const mailtemplate = (0, completeProfile_1.completeprofileTemplate)(firstname, verifyEmailUrl);
            yield this.mailService.sendMail({ to: email, subject: "Verify Your Email Address", html: mailtemplate });
        });
        this.removePassword = (distributor) => {
            const { password } = distributor, sanitizedData = __rest(distributor, ["password"]);
            return sanitizedData;
        };
        this.forgotPassword = (email) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authRepository.getDistributor(email);
            if (!user) {
                throw new error_1.BadRequestError("No Email with associated Account!");
            }
            if (!user.verified) {
                throw new error_1.BadRequestError("Please verify your email first!");
            }
            const userToken = (0, jwt_1.createAcessToken)(user);
            const addPasswordUrl = `${process.env.FRONTENDURL}/reset-password?token=${userToken}`;
            const mailtemplate = (0, resetPassword_1.createresetTemplate)(user.firstName, addPasswordUrl);
            yield this.mailService.sendMail({ to: email, subject: "Reset Your Password", html: mailtemplate });
        });
        this.cloudinaryService = new cloudinary_service_1.default();
        this.authRepository = new auth_repositories_1.default();
        this.mailService = new mail_service_1.default();
    }
}
exports.default = AuthService;
