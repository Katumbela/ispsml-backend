/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './client/student.module';
import { PrismaService } from './common/services/prisma.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { env } from './config/env';
import { AuthModule } from './auth/auth.module';
import { ApplicationModule } from './application/application.module';
import { CourseModule } from './courses/courses.module';
import { DepartmentModule } from './departments/department.module';
import { EventModule } from './event/event.module';
import { NewsModule } from './news/news.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: env.MAIL_HOST,
        port: parseInt(env.MAIL_PORT) || 587,
        auth: {
          user: env.MAIL_USER,
          pass: env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"R360 - NO REPLY" <${env.MAIL_FROM}>`,
      },
      template: {
        dir: './src/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    StudentModule,
    AuthModule,
    ApplicationModule,
    CourseModule,
    DepartmentModule,
    RoleModule,
    NewsModule,
    EventModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule { }
