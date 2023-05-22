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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("./user.repository");
const lisiting_repository_1 = __importDefault(require("../lisiting/lisiting.repository"));
const cloudinary_service_1 = __importDefault(require("../cloud/cloudinary.service"));
const compressImage_1 = __importDefault(require("../../utils/fileStorage/compressImage"));
class UserController {
}
exports.default = UserController;
_a = UserController;
UserController.userRepository = new user_repository_1.UserRepository();
UserController.listingRepository = new lisiting_repository_1.default();
UserController.cloudinaryService = new cloudinary_service_1.default();
UserController.getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const profile = yield _a.userRepository.getProfile(id);
    res.json({ success: true, data: profile });
});
/* Logic for uploading the image */
UserController.uploadImage = (imagepath) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imagepath) {
        return "";
    }
    ;
    const { imageUrl } = yield _a.cloudinaryService.uploadImage(imagepath);
    return imageUrl;
});
UserController.addKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const file = files[0];
    const userId = req.user.id;
    const fieldname = file.fieldname;
    const imageUrl = yield _a.uploadImage(file.path);
    const updatedKyc = yield _a.userRepository.updateKYC(imageUrl, userId, fieldname);
    res.status(201).json({ success: true, data: updatedKyc });
});
UserController.updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const profileData = req.body;
    // convert the types to match types in database
    const { financeRequired, dealSizeMax, dealSizeMin, businessNo } = profileData;
    profileData.financeRequired = Boolean(financeRequired);
    profileData.dealSizeMax = Number(dealSizeMax);
    profileData.dealSizeMin = Number(dealSizeMin);
    profileData.businessNo = Number(businessNo);
    const file = yield (0, compressImage_1.default)(req.file);
    const imageUrl = yield _a.uploadImage(file.path);
    if (imageUrl) {
        profileData.imageUrl = imageUrl;
    }
    const updatedProfile = yield _a.userRepository.updateProfile(id, profileData);
    res.json({ success: true, data: { updatedProfile } });
});
UserController.subscribeforUpdates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    yield _a.userRepository.subscribeforUpdates(id);
    return res.json({ success: true });
});
UserController.profilewithListingCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const profile = yield _a.userRepository.getProfile(id); // returns the user profile
    const [lisitingCount, watchedListingCount] = yield _a.listingRepository.getListingCount(id);
    res.json({ success: true, data: { profile, lisitingCount, watchedListingCount } });
});
