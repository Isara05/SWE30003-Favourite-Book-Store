import { Global, Module } from '@nestjs/common';
import { DatabaseProxyService } from './database-proxy.service';

@Global()
@Module({
  providers: [DatabaseProxyService],
  exports: [DatabaseProxyService],
})
export class DatabaseModule {}
