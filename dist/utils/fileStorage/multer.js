"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const error_1 = require("../../common/error");
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
require("express-async-errors");
// This specifies where to put the images locally
const multerStorage = multer_1.default.diskStorage({
    destination: (request, file, callback) => {
        callback(null, __dirname);
    },
    /* Verifies the image file format is supported */
    filename: (request, file, callback) => {
        const minmetypes = ["image/png", "image/jpeg", "image/jpg"];
        if (!minmetypes.includes(file.mimetype)) {
            const filePath = path_1.default.join(__dirname, file.originalname);
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch (err) {
                callback(new error_1.BadRequestError("Image format not supported!"), file.originalname);
            }
            callback(new error_1.BadRequestError("Image format not supported!"), file.originalname);
        }
        callback(null, file.originalname);
    }
});
const fileFilter = (req, file, callback) => {
    /*Define an array of allowed fields*/
    const allowedFields = ['image', 'driversLicense', 'Passport', 'VotersId', 'NationalIDCard']; // Add the field names you want to allow
    /* Check if the field name of the current file matches any of the allowed fields */
    if (!allowedFields.includes(file.fieldname)) {
        // Reject the file
        const filePath = path_1.default.join(__dirname, file.originalname);
        try {
            (0, fs_1.unlinkSync)(filePath);
        }
        catch (err) {
            callback(new error_1.BadRequestError("Image field not expected!"), file.originalname);
        }
        callback(new error_1.BadRequestError("Image field not expected!"), file.originalname);
    }
    callback(null, file.originalname);
};
// work on making sure only one file is sent to the backend at any point - might not work on it sha
exports.multerUpload = (0, multer_1.default)({ storage: multerStorage, fileFilter });
