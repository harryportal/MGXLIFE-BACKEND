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
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../utils/db/prisma");
class AuthRepository {
    constructor() {
        this.getDistributor = (email) => __awaiter(this, void 0, void 0, function* () {
            const distributor = yield this.distributor.findUnique({
                where: { email }
            });
            return distributor;
        });
        this.verifyDistributor = (email) => __awaiter(this, void 0, void 0, function* () {
            yield this.distributor.update({
                where: { email }, data: { verified: true }
            });
        });
        this.createDistributorwithReferral = (distributor, refferedById) => __awaiter(this, void 0, void 0, function* () {
            const userData = yield this.distributor.create({
                data: Object.assign(Object.assign({}, distributor), { referredBy: { connect: { referringId: refferedById } } })
            });
            return userData;
        });
        this.getDistributorwithReferalId = (referringId) => __awaiter(this, void 0, void 0, function* () {
            const distributor = yield this.distributor.findUnique({
                where: { referringId }
            });
            return distributor;
        });
        this.createDistributorwithoutReferral = (distributor) => __awaiter(this, void 0, void 0, function* () {
            const userData = yield this.distributor.create({ data: Object.assign({}, distributor) });
            return userData;
        });
        this.getRefreshToken = (refreshToken) => __awaiter(this, void 0, void 0, function* () {
            const token = yield this.refreshToken.findUnique({ where: { token: refreshToken } });
            return token;
        });
        this.deleteRefreshToken = (refreshToken) => __awaiter(this, void 0, void 0, function* () {
            yield this.refreshToken.delete({ where: { token: refreshToken } });
        });
        this.resetPassword = (distributorId, password) => __awaiter(this, void 0, void 0, function* () {
            yield this.distributor.update({
                where: { id: distributorId }, data: { password }
            });
        });
        this.createRefreshToken = (refreshToken, expiresAt, distributorId) => __awaiter(this, void 0, void 0, function* () {
            yield this.refreshToken.create({
                data: {
                    expiresAt,
                    token: refreshToken,
                    distributor: { connect: { id: distributorId } }
                }
            });
        });
        this.distributor = prisma_1.prisma.distributor;
        this.refreshToken = prisma_1.prisma.refreshToken;
    }
}
exports.default = AuthRepository;
