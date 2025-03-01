/* eslint-disable prettier/prettier */

import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PrismaService } from '../common/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../utils/email-sender.services';

@Module({
  controllers: [StudentController],
  providers: [StudentService, PrismaService, JwtService, EmailService],
})
export class StudentModule {}
