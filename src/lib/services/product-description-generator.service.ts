import { OpenRouterService } from './openrouter.service';
import { OpenRouterConfig } from './openrouter.types';

export type GenerationStyle = 'professional' | 'casual' | 'sales-focused';
export type GenerationLanguage = 'pl' | 'en';

export interface GenerationConfig {
  style: GenerationStyle;
  language: GenerationLanguage;
}

export interface GeneratedDescription {
  shortDescription: string;
  longDescription: string;
  metaDescription: string;
}

export class ProductDescriptionGeneratorService {
  private openRouter: OpenRouterService;
  private readonly stylePrompts: Record<GenerationStyle, string> = {
    professional: 'Używaj profesjonalnego, technicznego języka. Skup się na specyfikacji i szczegółach technicznych.',
    casual: 'Używaj przyjaznego, konwersacyjnego tonu. Pisz tak, jakbyś rozmawiał z przyjacielem.',
    'sales-focused': 'Podkreślaj korzyści i wartość produktu. Używaj języka nakierowanego na sprzedaż i przekonywanie.'
  };

  private readonly languageInstructions: Record<GenerationLanguage, string> = {
    pl: 'Generuj opis w języku polskim.',
    en: 'Generate description in English.'
  };

  constructor(config: OpenRouterConfig) {
    this.openRouter = new OpenRouterService({
      ...config,
      defaultModel: 'openai/gpt-4o-mini',
      maxRetries: 3,
      timeout: 60000
    });
  }

  private async generateWithFallback(
    productData: any,
    config: GenerationConfig
  ): Promise<GeneratedDescription> {
    try {
      return await this.generateUsingOpenRouter(productData, config);
    } catch (error) {
      console.error('OpenRouter generation failed:', error);
      return this.generateFallbackDescription(productData);
    }
  }

  private generateFallbackDescription(productData: any): GeneratedDescription {
    // Fallback do mocków w przypadku błędu
    return {
      shortDescription: `${productData.name} - wysokiej jakości produkt`,
      longDescription: `${productData.name} to produkt wysokiej jakości, który spełni Twoje oczekiwania.`,
      metaDescription: `Odkryj ${productData.name} - produkt, który zmieni Twoje życie. Sprawdź już teraz!`
    };
  }

  private async generateUsingOpenRouter(
    productData: any,
    config: GenerationConfig
  ): Promise<GeneratedDescription> {
    const { style, language } = config;
    
    console.log('Generating description for product:', {
      productId: productData.id,
      style,
      language
    });
    
    const systemPrompt = `
      Jesteś ekspertem w tworzeniu opisów produktów.
      ${this.stylePrompts[style]}
      ${this.languageInstructions[language]}
      
      Wygeneruj trzy opisy produktu:
      1. Krótki opis (max 500 znaków)
      2. Długi opis w HTML (szczegółowy, z formatowaniem)
      3. Meta description (155-160 znaków, zoptymalizowany pod SEO)
      
      Bazuj na dostarczonych danych o produkcie.
      Format odpowiedzi:
      SHORT:
      [krótki opis]
      LONG:
      [długi opis HTML]
      META:
      [meta description]
    `.trim();

    const productContext = `
      Nazwa: ${productData.name}
      SKU: ${productData.sku}
      ${productData.metadata ? `Metadane: ${JSON.stringify(productData.metadata)}` : ''}
      ${productData.categories?.length ? `Kategorie: ${productData.categories.map(c => c.name).join(', ')}` : ''}
      ${productData.collections?.length ? `Kolekcje: ${productData.collections.map(c => c.name).join(', ')}` : ''}
    `.trim();

    this.openRouter.setSystemMessage(systemPrompt);

    const response = await this.openRouter.chat({
      messages: [
        {
          role: 'user',
          content: productContext
        }
      ]
    });

    const content = response.choices[0].message.content;
    const parts = content.split('\n');

    let shortDescription = '';
    let longDescription = '';
    let metaDescription = '';

    let currentSection = '';
    for (const part of parts) {
      if (part.startsWith('SHORT:')) {
        currentSection = 'short';
      } else if (part.startsWith('LONG:')) {
        currentSection = 'long';
      } else if (part.startsWith('META:')) {
        currentSection = 'meta';
      } else {
        switch (currentSection) {
          case 'short':
            shortDescription += part + '\n';
            break;
          case 'long':
            longDescription += part + '\n';
            break;
          case 'meta':
            metaDescription += part + '\n';
            break;
        }
      }
    }

    return {
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      metaDescription: metaDescription.trim()
    };
  }

  public async generateDescription(
    productData: any,
    config: GenerationConfig
  ): Promise<GeneratedDescription> {
    return this.generateWithFallback(productData, config);
  }
}
