import { Order } from "@prisma/client";
import IPagination from "../../utils/pagination/pagination.interface";


export type AddOrder = Omit<Order, "id">

export interface IOrderRepository {
    addOrder(orderData: AddOrder): Promise<Order>;
    getOrder(orderId: string): Promise<Order | null>;
    getAllOrders(paginationObject: IPagination): Promise<Order[]>;
  }

export const OTypes = {
    IOrderRepository: Symbol("IOrderRepository")
};