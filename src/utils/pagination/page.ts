import IPagination from "./pagination.interface";

/* 
This is an utitilty function that uses prisma logic to implement pagination 
It returns the number of expected data for the current page and the number of rows to be skipped in db
*/
export default function current_page(pageNumber:string):IPagination{
  let pagenumber = Number(pageNumber) || 1;
  const take = Number(process.env.PAGE_SIZE);  // This is the page size, using take since it correlates with prisma's term
  const skip = (pagenumber - 1) * take;
  return {take, skip};
};
