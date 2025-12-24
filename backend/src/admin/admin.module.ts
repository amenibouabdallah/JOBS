import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JeModule } from '../je/je.module';

@Module({
  imports: [JeModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}