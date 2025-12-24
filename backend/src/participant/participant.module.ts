import { Module } from '@nestjs/common';
import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';
import { UploadsModule } from '../uploads/uploads.module'; // Import UploadsModule

@Module({
  imports: [UploadsModule], // Add UploadsModule to imports
  controllers: [ParticipantController],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}

