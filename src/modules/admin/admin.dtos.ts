import { Admin } from "@prisma/client";
import { UpdateProduct } from "./admin.validation";

export type UpdateAdmin = Pick<Admin, "firstName" | "lastName" | "imageUrl">
export type File = Express.Multer.File;

export interface IAdminRepository {
    getAdmin(email: string): Promise<Admin | null>;
    updateAdmin(id: string, updateData: UpdateAdmin): Promise<Partial<Admin>>;
    resetPassword(id:string, newPassword:string):Promise<void>;
}

export interface IAdminService {
  signIn(email: string, password: string): Promise<string>;
  updateAdmin(updateData: UpdateAdmin, adminId: string, imageFile: File | null): Promise<any>;
  getAllProducts(pageNumber: string): Promise<any>; // Update the return type as needed
  getAllDistributors(pageNumber: string): Promise<any>; // Update the return type as needed
  getAllOrders(pageNumber: string): Promise<any>; // Update the return type as needed
  updateProduct(productId: string, updateData: UpdateProduct): Promise<any>; // Update the return type as needed
  getProfile(adminEmail:string):Promise<Omit<Admin, "password">>;
  resetPassword(secret:string, password:string, confirmPassword:string, id:string):Promise<void>;
}




export const AdTypes = {
    IAdminRepository: Symbol("IAdminRepository"),
    IAdminService: Symbol("IAdminService")
}
  
  
  