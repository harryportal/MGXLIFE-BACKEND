import { prisma } from "../../db/prisma";
import { hashPassword } from "../../jwtAuth/jwt";
import logger from "../../logging/winston";

const seedAdmin = async():Promise<void>=>{
    try {
      const admin = await prisma.admin.create({
        data: {
          firstName: process.env.ADMIN_FIRSTNAME!,
          lastName: process.env.ADMIN_LASTNAME!,
          email: process.env.ADMIN_EMAIL!,
          password: await hashPassword(process.env.ADMIN_PASSWORD!)
        }
      });
      logger.info('Admin seeded successfully:', admin.id);
    } catch (error) {
      logger.error('Error seeding admin:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
export default seedAdmin;