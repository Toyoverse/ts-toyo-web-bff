import { Expose } from 'class-transformer';
import { from } from 'rxjs';
import { SerializeInterceptor } from 'src/interceptors/serialize.interceptor';

class EndClass {
  @Expose()
  id: string;
  @Expose()
  name: string;
}

describe('SerializeInterceptor', () => {
  const interceptor = new SerializeInterceptor(EndClass);

  describe('intercept', () => {
    it('pipes a serialization from incoming data to expected instance', (done) => {
      const incoming = {
        id: '63174466',
        name: 'Example 1',
        description: 'Lorem impsum nat. dev ur',
      };

      const source = from([incoming]);

      const next = {
        handle: () => {
          return {
            pipe: (fn: any) => {
              return source.pipe(fn);
            },
            subscribe: (fn: any) => {
              return source.subscribe(fn);
            },
          };
        },
      };

      const expected = {
        id: incoming.id,
        name: incoming.name,
      };

      interceptor.intercept({} as any, next as any).subscribe((data) => {
        expect(data).toEqual(expected);
        done();
      });
    });
  });
});
