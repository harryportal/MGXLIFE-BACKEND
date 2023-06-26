export default function current_page(pageNumber:string){
  let pagenumber = Number(pageNumber) || 1;
  const page_size = Number(process.env.PAGE_SIZE);
  const skip = (pagenumber - 1) * page_size;
  return [page_size, skip];
};
