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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prisma = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const winston_1 = __importDefault(require("../logging/winston"));
// creates and return a reusable prisma client
class Prisma {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    connectDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.$connect();
                winston_1.default.info("Connected to Database Successsfully");
            }
            catch (error) {
                winston_1.default.error("Error Connecting to Database", error);
                process.exit(1);
            }
            finally {
                yield this.prisma.$disconnect();
            }
        });
    }
}
exports.Prisma = Prisma;
;
const prisma = new Prisma().prisma;
exports.prisma = prisma;
