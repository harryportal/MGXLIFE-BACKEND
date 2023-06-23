import { prisma } from "../../utils/db/prisma";
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
}