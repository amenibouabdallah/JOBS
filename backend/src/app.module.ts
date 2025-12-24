import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JeModule } from './je/je.module';
import { AdminModule } from './admin/admin.module';
import { ParticipantModule } from './participant/participant.module';
import { PaymentModule } from './payment/payment.module';
import { ActivityModule } from './activity/activity.module';
import { SalleModule } from './salle/salle.module';
import { ActivityTypeModule } from './activity-type/activity-type.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { UploadsModule } from './uploads/uploads.module';
import { JobsModule } from './jobs/jobs.module';
import { ZoneModule } from './zone/zone.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    JeModule,
    AdminModule,
    ParticipantModule,
    PaymentModule,
    ActivityModule,
    SalleModule,
    ActivityTypeModule,
    UploadsModule,
    JobsModule,
    ZoneModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards - order matters!
    // 1. JWT guard authenticates the user
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 2. Roles guard checks user permissions (runs after JWT)
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
