"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddResetPassword = exports.Profile = exports.SignUp = exports.SignIn = void 0;
const class_validator_1 = require("class-validator");
class SignIn {
}
__decorate([
    (0, class_validator_1.IsEmail)()
], SignIn.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], SignIn.prototype, "password", void 0);
exports.SignIn = SignIn;
class SignUp {
}
__decorate([
    (0, class_validator_1.IsString)()
], SignUp.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], SignUp.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)()
], SignUp.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], SignUp.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)()
], SignUp.prototype, "referringId", void 0);
exports.SignUp = SignUp;
class Profile {
}
__decorate([
    (0, class_validator_1.IsString)()
], Profile.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)()
], Profile.prototype, "businessNo", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], Profile.prototype, "businessCategory", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], Profile.prototype, "businessModel", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)()
], Profile.prototype, "dealSizeMin", void 0);
__decorate([
    (0, class_validator_1.IsNumberString)()
], Profile.prototype, "dealSizeMax", void 0);
__decorate([
    (0, class_validator_1.IsBooleanString)()
], Profile.prototype, "financeRequired", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], Profile.prototype, "aboutCompany", void 0);
exports.Profile = Profile;
class AddResetPassword {
}
__decorate([
    (0, class_validator_1.IsString)()
], AddResetPassword.prototype, "token", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], AddResetPassword.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)()
], AddResetPassword.prototype, "confirmPasswor", void 0);
exports.AddResetPassword = AddResetPassword;
