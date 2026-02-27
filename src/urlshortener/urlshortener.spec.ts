import { Test } from '@nestjs/testing';
import { UrlShortenerService } from './urlshortener.service';
import { UrlShortenerController } from './urlshortener.controller';
import { getQueueToken } from '@nestjs/bullmq';

const mockUrlService = {
  getOriginalUrl: jest.fn(),
  getAnalytics: jest.fn(),
  create: jest.fn(),
}

const mockQueue = {
  add: jest.fn(),
}

describe('UrlShortenerController', () => {
  let urlShortenerController: UrlShortenerController;
  let urlShortenerService: UrlShortenerService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UrlShortenerController],
      providers: [
        {
          provide: UrlShortenerService,
          useValue: mockUrlService,
        },
        {
          provide: getQueueToken('analytics'),
          useValue: mockQueue,
        }
      ],
    }).compile()

    urlShortenerService = moduleRef.get(UrlShortenerService);
    urlShortenerController = moduleRef.get(UrlShortenerController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  // 1. Case 1: Shorten and return an object containing the slug and long url
  describe('Shorten a url', () => {
    it('Should shorten an return an Object with the slug, short Url and a long Url', async () => {
      const dto = { payload: 'https://google.com' }
      const user = { id: 1, email: 'test@gmail.com' }
      const expectedResult = {
        slug: 'abc123',
        short_url: 'minurl/abc123',
        original_url: 'https://google.com',
      }

      mockUrlService.create.mockResolvedValue(expectedResult);

      const result = await urlShortenerController.shortenUrl(dto, user);

      expect(result).toEqual(expectedResult);
      expect(urlShortenerService.create).toHaveBeenCalledWith(dto, user);
      expect(urlShortenerService.create).toHaveBeenCalledTimes(1);
    })
  });

  // 2. Track analytics when user ID is called
  describe('Redirect to original URL', () => {
    it('Should redirect and track analytics if user_id is present', async () => {
      const mockSlug = 'abc123';

      const mockUrlRecord = {
        id: 55,
        slug: 'abc123',
        long_url: 'https://google.com',
        user_id: 1,
      }

      const mockReq = {
        headers: {
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1'
      }

      mockUrlService.getOriginalUrl.mockResolvedValue(mockUrlRecord);

      const result = await urlShortenerController.redirectToOriginalUrl(mockSlug, mockReq as any);

      expect(result.url).toBe('https://google.com');
      expect(mockQueue.add).toHaveBeenCalled();
    });
  });

  // 3. Redirect and NOT Track analytics when user ID is called
  describe('Redirect to original URL', () => {
    it('Should redirect and NOT track analytics if user_id is null', async () => {
      const mockSlug = 'abc123';

      const mockUrlRecord = {
        id: 55,
        slug: 'abc123',
        long_url: 'https://google.com',
        user_id: null,
      }

      const mockReq = {
        headers: {
          'user-agent': 'test-agent',
        },
        ip: '127.0.0.1'
      }

      mockUrlService.getOriginalUrl.mockResolvedValue(mockUrlRecord);

      const result = await urlShortenerController.redirectToOriginalUrl(mockSlug, mockReq as any);

      expect(result.url).toBe('https://google.com');
    });
  });

  // 4. Test for analytics
  describe('Return analytics of a given slug', () => {
    it('Should return the analytics of a given slug', async () => {
      const slug = 'my-slug';
      const mockUser = {
        id: 1,
        email: "test@gmail.com",
      }
      const mockStats = {
        total_clicks: 10,
        long_url: 'https://example.com',
        breakdown: {
          browsers: [],
          os: [],
          devices: [],
        }
      };
      mockUrlService.getAnalytics.mockResolvedValue(mockStats);

      const result = await urlShortenerController.getAnalytics(slug, mockUser);

      expect(result).toEqual(mockStats);
      expect(urlShortenerService.getAnalytics).toHaveBeenCalledWith(slug, mockUser);
    })
  })

});