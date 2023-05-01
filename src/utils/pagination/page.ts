import { Request } from 'express';

const current_page = (req: Request) => {
  let pagenumber = Number(req.query.page) || 1;
  const page_size = Number(process.env.PAGE_SIZE);
  const skip = (pagenumber - 1) * page_size;
  return [page_size, skip];
};

export default current_page;