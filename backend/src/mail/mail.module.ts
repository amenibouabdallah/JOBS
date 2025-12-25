import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('MAIL_HOST'),
          port: Number(configService.get('MAIL_PORT')) || 587,
          secure: (configService.get('MAIL_SECURE') === 'true') || Number(configService.get('MAIL_PORT')) === 465,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
          // Increase timeouts significantly for OVH
          greetingTimeout: 30000,
          connectionTimeout: 30000,
          socketTimeout: 30000,
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2',
          },
          // Add socket options
          pool: false, // Disable connection pooling
          maxConnections: 1,
          rateDelta: 20000,
          rateLimit: 5,
          logger: true,
          debug: true,
        },
        defaults: {
          from: `${configService.get('MAIL_FROM')}`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}