import { Module } from '@nestjs/common';
import { JeService } from './je.service';
import { JeController } from './je.controller';
import { UploadsModule } from '../uploads/uploads.module'; // Import UploadsModule
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [UploadsModule, MailModule], // Add UploadsModule to imports
  controllers: [JeController],
  providers: [JeService],
  exports: [JeService],
})
export class JeModule {}
