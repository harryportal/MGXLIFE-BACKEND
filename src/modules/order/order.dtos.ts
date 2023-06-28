import { Order } from "@prisma/client";


export type AddOrder = Omit<Order, "id">

