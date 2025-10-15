import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductDescriptionGeneratorService, GenerationStyle, GenerationLanguage } from '../product-description-generator.service';
import { OpenRouterService } from '../openrouter.service';

// Mock OpenRouterService
vi.mock('../openrouter.service', () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    chat: vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mocked description' } }]
    })
  }))
}));

describe('ProductDescriptionGeneratorService', () => {
  let service: ProductDescriptionGeneratorService;
  const mockConfig = {
    apiKey: 'test-key',
    baseUrl: 'http://test.com'
  };

  const mockProductData = {
    name: 'Test Product',
    description: 'Basic description',
    price: 99.99,
    categories: ['Electronics']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductDescriptionGeneratorService(mockConfig);
  });

  describe('Generation Configuration', () => {
    it('should initialize with default model and settings', () => {
      expect(service).toBeInstanceOf(ProductDescriptionGeneratorService);
      expect(OpenRouterService).toHaveBeenCalledWith({
        ...mockConfig,
        defaultModel: 'openai/gpt-4o-mini',
        maxRetries: 3,
        timeout: 60000
      });
    });

    it('should handle all generation styles', async () => {
      const styles: GenerationStyle[] = ['professional', 'casual', 'sales-focused'];
      for (const style of styles) {
        await service.generateDescription(mockProductData, {
          style,
          language: 'pl'
        });
        expect(service['openRouter'].chat).toHaveBeenCalled();
      }
    });

    it('should handle all supported languages', async () => {
      const languages: GenerationLanguage[] = ['pl', 'en'];
      for (const language of languages) {
        await service.generateDescription(mockProductData, {
          style: 'professional',
          language
        });
        expect(service['openRouter'].chat).toHaveBeenCalled();
      }
    });
  });

  describe('Description Generation', () => {
    it('should generate both short and long descriptions', async () => {
      const result = await service.generateDescription(mockProductData, {
        style: 'professional',
        language: 'pl'
      });

      expect(result).toHaveProperty('shortDescription');
      expect(result).toHaveProperty('longDescription');
      expect(result).toHaveProperty('metaDescription');
    });

    it('should include product details in generation prompt', async () => {
      await service.generateDescription(mockProductData, {
        style: 'professional',
        language: 'pl'
      });

      const chatCall = vi.mocked(service['openRouter'].chat).mock.calls[0][0];
      expect(chatCall.messages[0].content).toContain(mockProductData.name);
      expect(chatCall.messages[0].content).toContain(mockProductData.description);
    });

    it('should handle products with missing optional fields', async () => {
      const incompleteProduct = {
        name: 'Test Product',
        description: 'Basic description'
      };

      await expect(service.generateDescription(incompleteProduct as any, {
        style: 'professional',
        language: 'pl'
      })).resolves.toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid product data', async () => {
      await expect(service.generateDescription(null as any, {
        style: 'professional',
        language: 'pl'
      })).rejects.toThrow();
    });

    it('should handle API errors gracefully', async () => {
      vi.mocked(service['openRouter'].chat).mockRejectedValueOnce(new Error('API Error'));

      await expect(service.generateDescription(mockProductData, {
        style: 'professional',
        language: 'pl'
      })).rejects.toThrow('API Error');
    });

    it('should retry on temporary failures', async () => {
      const temporaryError = new Error('Temporary error');
      vi.mocked(service['openRouter'].chat)
        .mockRejectedValueOnce(temporaryError)
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Retry success' } }]
        });

      const result = await service.generateDescription(mockProductData, {
        style: 'professional',
        language: 'pl'
      });

      expect(result).toBeDefined();
      expect(service['openRouter'].chat).toHaveBeenCalledTimes(2);
    });
  });

  describe('Content Quality', () => {
    it('should generate unique descriptions for different products', async () => {
      const product1 = { ...mockProductData, name: 'Product 1' };
      const product2 = { ...mockProductData, name: 'Product 2' };

      vi.mocked(service['openRouter'].chat)
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Description 1' } }]
        })
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'Description 2' } }]
        });

      const result1 = await service.generateDescription(product1, {
        style: 'professional',
        language: 'pl'
      });
      const result2 = await service.generateDescription(product2, {
        style: 'professional',
        language: 'pl'
      });

      expect(result1.longDescription).not.toBe(result2.longDescription);
    });

    it('should adapt tone based on style selection', async () => {
      const mockChat = vi.mocked(service['openRouter'].chat);

      await service.generateDescription(mockProductData, {
        style: 'professional',
        language: 'pl'
      });
      expect(mockChat.mock.calls[0][0].messages[0].content).toContain('profesjonalnego');

      await service.generateDescription(mockProductData, {
        style: 'casual',
        language: 'pl'
      });
      expect(mockChat.mock.calls[1][0].messages[0].content).toContain('przyjaznego');
    });
  });
});
