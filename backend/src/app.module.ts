import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ControlsModule } from './controls/controls.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://haccp:haccp_secret@localhost:5432/haccpmanager',
      autoLoadEntities: true,
      synchronize: true,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    ControlsModule,
    ProductsModule,
    ReportsModule,
  ],
})
export class AppModule {}
