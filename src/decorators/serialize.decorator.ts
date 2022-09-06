import { UseInterceptors } from '@nestjs/common';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';
import { ClassConstructor } from 'class-transformer';

export function Serialize(dtoCls: ClassConstructor<any>) {
  return UseInterceptors(new SerializeInterceptor(dtoCls));
}
