import { ToyoPersonaController } from 'src/controller';
import ToyoPersonaModel from 'src/models/ToyoPersona.model';

describe('ToyoPersonaController', () => {
  const service = {
    findToyoPersonas: jest.fn(),
  };
  const controller = new ToyoPersonaController(service as any);
  describe('find', () => {
    it('returns list of toyo personas', async () => {
      const expected: ToyoPersonaModel[] = [
        new ToyoPersonaModel({
          id: 'adfa3d',
          name: 'Tatsu',
          thumbnail: 'https://www.images.com/tatsu.jpeg',
          video: 'https://www.videos.com/tatsu.mp4',
          bodyType: 1,
          createdAt: new Date(),
          updateAt: new Date(),
          region: 'Kytunt',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquam.',
          rarity: 'COMMON',
        }),
        new ToyoPersonaModel({
          id: 'fdafdaf',
          name: 'Lao Qing',
          thumbnail: 'https://www.images.com/lao-qing.jpeg',
          video: 'https://www.videos.com/lao-qing.mp4',
          bodyType: 1,
          createdAt: new Date(),
          updateAt: new Date(),
          region: 'Jakana',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean aliquam.',
          rarity: 'COLLECTOR',
        }),
      ];

      service.findToyoPersonas.mockResolvedValue(expected);

      const result = await controller.find();

      expect(result).toBe(expected);
    });
  });
});
