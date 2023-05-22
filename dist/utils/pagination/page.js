"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const current_page = (req) => {
    let pagenumber = Number(req.query.page) || 1;
    const page_size = Number(process.env.PAGE_SIZE);
    const skip = (pagenumber - 1) * page_size;
    return [page_size, skip];
};
exports.default = current_page;
