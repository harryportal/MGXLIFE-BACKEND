import "reflect-metadata";
import app from './app';
import * as dotenv from 'dotenv';
import logger from './utils/logging/winston';
import {Prisma }from './database/prisma.service';
import { Application } from 'express';
import { createServer, Server as httpServer } from "http"
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
 
class Server {
  private port = process.env.PORT || 8000;
  private prisma = new Prisma();
  private server: httpServer;
  constructor(app: Application) {
      this.server = createServer(app).on("listening", () => {
        logger.info(`Listening on url http://localhost:${this.port}`);
      })
  }

  start() {
      this.prisma.connectDB();
      this.server.listen()
  }
}

const server =  new Server(app);
server.start()
