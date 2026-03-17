import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProposalsController } from './proposals/proposals.controller';
import { ProposalsService } from './proposals/proposals.service';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../env.config',
      load: [configuration],
      isGlobal: true,
    }),
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService],
})
export class AppModule {}
