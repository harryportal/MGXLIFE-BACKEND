import { prisma } from "../../prisma.service";
import { hashPassword } from "../../../utils/jwtAuth/jwt";
import logger from "../../../utils/logging/winston";

const seedAdmin = async():Promise<void>=>{
    try {
      console.log(process.env.ADMIN_PASSWORD)
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