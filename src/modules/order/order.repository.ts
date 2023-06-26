import { prisma } from "../../utils/db/prisma";
import IPagination from "../../utils/pagination/pagination.interface";
import { AddOrder } from "./order.dtos";

export class OrderRepository{
    private order = prisma.order;

    public addOrder = async(orderData:AddOrder)=>{
        const order = await this.order.create({
            data: {
                ...orderData
            }
        });
        return order;  
    }

    public getOrder = async(orderId:string)=>{
        const order = await this.order.findUnique({
            where:{ shopifyId: orderId}
        })
        return order;
    }

    public getAllOrders = async(paginationObject:IPagination)=>{
        const {take, skip} = paginationObject;
        const orders = await this.order.findMany({take, skip});
        return orders;
    }
}