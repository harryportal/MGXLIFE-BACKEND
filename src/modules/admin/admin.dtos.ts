import { Admin } from "@prisma/client";

export type UpdateAdmin = Pick<Admin, "firstName" | "lastName" | "imageUrl">
export type File = Express.Multer.File