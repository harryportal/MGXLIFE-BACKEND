import nodemailer from 'nodemailer';
import { IMailService, MailInterface }from './mail.dto';
import logger from '../../utils/logging/winston';
import * as dotenv from "dotenv";


dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


export default class MailService implements IMailService{
    private transporter: nodemailer.Transporter;
    constructor(){
            this.createConnection();
    };
    
    private async createConnection() {
        this.transporter = nodemailer.createTransport({
            service:"gmail",
            host:"smtp.gmail.com",
            port: 587,
            auth:{
                user:process.env.GOOGLE_MAIL_SENDER,
                pass:process.env.GOOGLE_APP_KEY
            }
        }) };

    async sendMail(
        options: MailInterface
    ) {
        return await this.transporter
            .sendMail({ 
                from: process.env.GOOGLE_MAIL_SENDER,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            })
            .then((info) => {
                logger.info(`Mail sent successfully!!`);
                logger.info(`[MailResponse]=${info.response} [MessageID]=${info.messageId}`);
                return info;
            })
            .catch((error)=>{
                logger.error("Error Sending Mail", error)
            });
    }
}