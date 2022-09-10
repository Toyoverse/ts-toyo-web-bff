import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { map, Observable } from 'rxjs';

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dtoCls: ClassConstructor<any>) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this._transform(data)));
  }

  private _transform(data: any): any {
    return plainToInstance(this.dtoCls, data, {
      excludeExtraneousValues: true,
    });
  }
}
