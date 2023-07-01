import { prisma } from "../../db/prisma";
import { hashPassword } from "../../jwtAuth/jwt";

const seedAdmin = async()=>{
    try {
      const admin = await prisma.admin.create({
        data: {
          firstName: process.env.ADMIN_FIRSTNAME!,
          lastName: process.env.ADMIN_LASTNAME!,
          email: process.env.ADMIN_EMAIL!,
          password: await hashPassword(process.env.ADMIN_PASSWORD!)
        }
      });
      console.log('Admin seeded successfully:', admin.id);
    } catch (error) {
      console.error('Error seeding admin:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
export default seedAdmin;