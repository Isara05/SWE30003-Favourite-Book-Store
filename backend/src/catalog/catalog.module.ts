import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, RolesGuard],
})
export class CatalogModule {}
