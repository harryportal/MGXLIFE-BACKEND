export interface MailInterface {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
}


export interface IMailService {
    sendMail(options: MailInterface):Promise<any>;
}