import { Module } from '@nestjs/common';
import { ActivityTypeController } from './activity-type.controller';
import { ActivityTypeService } from './activity-type.service';

@Module({
  controllers: [ActivityTypeController],
  providers: [ActivityTypeService],
})
export class ActivityTypeModule {}
