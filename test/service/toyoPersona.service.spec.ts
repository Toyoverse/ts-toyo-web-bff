import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { when } from 'jest-when';

import * as Parse from 'parse/node';
import ToyoPersonaModel from 'src/models/ToyoPersona.model';
import { ToyoPersonaService } from 'src/service';

jest.useFakeTimers();

jest.mock('parse/node');

describe('ToyoPersonaService', () => {
  let service: ToyoPersonaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ToyoPersonaService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ToyoPersonaService>(ToyoPersonaService);
  });

  it('returns all personas found', async () => {
    const expectedPersonas: ToyoPersonaModel[] = [
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

    const mockParseQueryConstructor = jest.mocked(Parse.Query);

    const mockParseQuery = { find: jest.fn() };

    when(mockParseQueryConstructor)
      .calledWith('ToyoPersona')
      .mockReturnValue(mockParseQuery as any);

    const parseQueryResult = [];

    for (const persona of expectedPersonas) {
      const parseObject = {
        id: persona.id,
        get: (key: string) => {
          if (key === 'updatedAt') return persona.updateAt;
          else return persona[key];
        },
      };
      parseQueryResult.push(parseObject);
    }

    mockParseQuery.find.mockResolvedValue(parseQueryResult);

    const personas = await service.findToyoPersonas();

    expect(personas).toEqual(expectedPersonas);
  });
});
