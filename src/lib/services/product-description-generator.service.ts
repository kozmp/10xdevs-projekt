import { OpenRouterService } from "./openrouter.service";
import { OpenRouterConfig } from "./openrouter.types";

/**
 * Available generation styles for product descriptions.
 * @typedef {"professional" | "casual" | "sales-focused"} GenerationStyle
 */
export type GenerationStyle = "professional" | "casual" | "sales-focused";

/**
 * Supported languages for product description generation.
 * @typedef {"pl" | "en"} GenerationLanguage
 */
export type GenerationLanguage = "pl" | "en";

/**
 * Configuration for product description generation.
 * @interface GenerationConfig
 * @property {GenerationStyle} style - The tone and style of the generated description
 * @property {GenerationLanguage} language - The language for the generated content
 */
export interface GenerationConfig {
  style: GenerationStyle;
  language: GenerationLanguage;
}

/**
 * Generated product descriptions in multiple formats.
 * @interface GeneratedDescription
 * @property {string} shortDescription - Concise description (max 500 characters)
 * @property {string} longDescription - Detailed HTML-formatted description
 * @property {string} metaDescription - SEO-optimized meta description (155-160 characters)
 */
export interface GeneratedDescription {
  shortDescription: string;
  longDescription: string;
  metaDescription: string;
}

/**
 * Service for generating AI-powered product descriptions using OpenRouter API.
 *
 * This service integrates with OpenRouter to generate professional product descriptions
 * in multiple formats (short, long, meta) with customizable style and language options.
 * It includes automatic fallback to mock descriptions when the AI service fails.
 *
 * @class ProductDescriptionGeneratorService
 *
 * @example
 * ```typescript
 * const generator = new ProductDescriptionGeneratorService({
 *   apiKey: process.env.OPENROUTER_API_KEY
 * });
 *
 * const description = await generator.generateDescription(
 *   { name: "Premium Coffee", sku: "COFFEE-001" },
 *   { style: "professional", language: "pl" }
 * );
 * ```
 *
 * @dependencies
 * - OpenRouterService: AI text generation service
 * - Uses OpenAI GPT-4o-mini model by default
 *
 * @see {@link OpenRouterService} for AI service implementation
 * @see {@link GenerationConfig} for configuration options
 */
export class ProductDescriptionGeneratorService {
  /**
   * OpenRouter service instance for AI text generation.
   * @private
   */
  private openRouter: OpenRouterService;

  /**
   * Style-specific prompt templates for different generation styles.
   * @private
   * @readonly
   */
  private readonly stylePrompts: Record<GenerationStyle, string> = {
    professional: "Używaj profesjonalnego, technicznego języka. Skup się na specyfikacji i szczegółach technicznych.",
    casual: "Używaj przyjaznego, konwersacyjnego tonu. Pisz tak, jakbyś rozmawiał z przyjacielem.",
    "sales-focused": "Podkreślaj korzyści i wartość produktu. Używaj języka nakierowanego na sprzedaż i przekonywanie.",
  };

  /**
   * Language-specific instructions for content generation.
   * @private
   * @readonly
   */
  private readonly languageInstructions: Record<GenerationLanguage, string> = {
    pl: "Generuj opis w języku polskim.",
    en: "Generate description in English.",
  };

  /**
   * Creates a new ProductDescriptionGeneratorService instance.
   *
   * @constructor
   * @param {OpenRouterConfig} config - Configuration for OpenRouter API
   * @param {string} config.apiKey - OpenRouter API key (required)
   * @param {string} [config.baseUrl] - Custom API base URL (optional)
   *
   * @throws {Error} If apiKey is not provided in config
   *
   * @remarks
   * The service is configured with the following defaults:
   * - Model: openai/gpt-4o-mini
   * - Max retries: 3
   * - Timeout: 60000ms (60 seconds)
   */
  constructor(config: OpenRouterConfig) {
    this.openRouter = new OpenRouterService({
      ...config,
      defaultModel: "openai/gpt-4o-mini",
      maxRetries: 3,
      timeout: 60000,
    });
  }

  /**
   * Generates product description with automatic fallback to mock data on failure.
   *
   * @private
   * @async
   * @param {unknown} productData - Product information for description generation
   * @param {GenerationConfig} config - Generation configuration (style and language)
   * @returns {Promise<GeneratedDescription>} Generated descriptions or fallback mock data
   *
   * @remarks
   * This method attempts to generate descriptions using OpenRouter AI.
   * If the AI service fails for any reason (network error, API error, rate limiting),
   * it automatically falls back to generating simple mock descriptions to ensure
   * the application continues to function.
   *
   * @see {@link generateUsingOpenRouter} for AI-based generation
   * @see {@link generateFallbackDescription} for fallback logic
   */
  private async generateWithFallback(productData: unknown, config: GenerationConfig): Promise<GeneratedDescription> {
    try {
      return await this.generateUsingOpenRouter(productData, config);
    } catch (error) {
      console.error("OpenRouter generation failed:", error);
      return this.generateFallbackDescription(productData);
    }
  }

  /**
   * Generates simple fallback product descriptions when AI service is unavailable.
   *
   * @private
   * @param {Object} productData - Minimal product data
   * @param {string} [productData.name] - Product name
   * @returns {GeneratedDescription} Basic mock descriptions based on product name
   *
   * @remarks
   * This fallback mechanism ensures the application remains functional even when
   * the AI service is unavailable. The generated descriptions are generic but
   * include the product name for basic personalization.
   *
   * @example
   * ```typescript
   * // Input: { name: "Coffee Maker" }
   * // Output:
   * {
   *   shortDescription: "Coffee Maker - wysokiej jakości produkt",
   *   longDescription: "Coffee Maker to produkt wysokiej jakości, który spełni Twoje oczekiwania.",
   *   metaDescription: "Odkryj Coffee Maker - produkt, który zmieni Twoje życie. Sprawdź już teraz!"
   * }
   * ```
   */
  private generateFallbackDescription(productData: { name?: string }): GeneratedDescription {
    // Fallback do mocków w przypadku błędu
    return {
      shortDescription: `${productData.name} - wysokiej jakości produkt`,
      longDescription: `${productData.name} to produkt wysokiej jakości, który spełni Twoje oczekiwania.`,
      metaDescription: `Odkryj ${productData.name} - produkt, który zmieni Twoje życie. Sprawdź już teraz!`,
    };
  }

  /**
   * Generates product descriptions using OpenRouter AI service.
   *
   * @private
   * @async
   * @param {any} productData - Complete product information
   * @param {string} productData.name - Product name (required)
   * @param {string} productData.sku - Product SKU code
   * @param {string} [productData.id] - Product unique identifier
   * @param {Object} [productData.metadata] - Additional product metadata
   * @param {Array} [productData.categories] - Product categories with names
   * @param {Array} [productData.collections] - Product collections with names
   * @param {GenerationConfig} config - Generation configuration
   * @param {GenerationStyle} config.style - Description style (professional, casual, sales-focused)
   * @param {GenerationLanguage} config.language - Target language (pl, en)
   * @returns {Promise<GeneratedDescription>} AI-generated product descriptions
   *
   * @throws {OpenRouterError} When API request fails
   * @throws {RateLimitError} When rate limit is exceeded
   *
   * @remarks
   * This method constructs a specialized prompt based on the chosen style and language,
   * then sends it to OpenRouter API (using GPT-4o-mini by default).
   *
   * **Response Format:**
   * The AI returns descriptions in a structured format:
   * - SHORT: Concise description (max 500 characters)
   * - LONG: Detailed HTML-formatted description
   * - META: SEO-optimized meta description (155-160 characters)
   *
   * **Potential Issues:**
   * - The parsing logic expects specific section markers (SHORT:, LONG:, META:)
   * - If the AI response format changes, parsing may fail
   * - Network timeouts set to 60 seconds
   *
   * @example
   * ```typescript
   * const productData = {
   *   id: "123",
   *   name: "Organic Coffee Beans",
   *   sku: "COFFEE-ORG-001",
   *   metadata: { origin: "Colombia", roast: "Medium" },
   *   categories: [{ name: "Coffee" }, { name: "Organic" }]
   * };
   *
   * const result = await this.generateUsingOpenRouter(productData, {
   *   style: "professional",
   *   language: "en"
   * });
   * ```
   */
  private async generateUsingOpenRouter(productData: any, config: GenerationConfig): Promise<GeneratedDescription> {
    const { style, language } = config;

    console.log("Generating description for product:", {
      productId: productData.id,
      style,
      language,
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
      ${productData.metadata ? `Metadane: ${JSON.stringify(productData.metadata)}` : ""}
      ${productData.categories?.length ? `Kategorie: ${productData.categories.map((c) => c.name).join(", ")}` : ""}
      ${productData.collections?.length ? `Kolekcje: ${productData.collections.map((c) => c.name).join(", ")}` : ""}
    `.trim();

    this.openRouter.setSystemMessage(systemPrompt);

    const response = await this.openRouter.chat({
      messages: [
        {
          role: "user",
          content: productContext,
        },
      ],
    });

    const content = response.choices[0].message.content;
    const parts = content.split("\n");

    let shortDescription = "";
    let longDescription = "";
    let metaDescription = "";

    let currentSection = "";
    for (const part of parts) {
      if (part.startsWith("SHORT:")) {
        currentSection = "short";
      } else if (part.startsWith("LONG:")) {
        currentSection = "long";
      } else if (part.startsWith("META:")) {
        currentSection = "meta";
      } else {
        switch (currentSection) {
          case "short":
            shortDescription += part + "\n";
            break;
          case "long":
            longDescription += part + "\n";
            break;
          case "meta":
            metaDescription += part + "\n";
            break;
        }
      }
    }

    return {
      shortDescription: shortDescription.trim(),
      longDescription: longDescription.trim(),
      metaDescription: metaDescription.trim(),
    };
  }

  /**
   * Generates comprehensive product descriptions in multiple formats.
   *
   * This is the main public API method for generating product descriptions.
   * It uses AI-powered generation with automatic fallback to ensure reliability.
   *
   * @public
   * @async
   * @param {any} productData - Product information object
   * @param {string} productData.name - Product name (required)
   * @param {string} [productData.sku] - Product SKU code
   * @param {string} [productData.id] - Product unique identifier
   * @param {Object} [productData.metadata] - Additional product metadata
   * @param {Array} [productData.categories] - Product categories (objects with 'name' property)
   * @param {Array} [productData.collections] - Product collections (objects with 'name' property)
   * @param {GenerationConfig} config - Configuration for generation
   * @param {GenerationStyle} config.style - Style: "professional", "casual", or "sales-focused"
   * @param {GenerationLanguage} config.language - Language: "pl" or "en"
   * @returns {Promise<GeneratedDescription>} Object containing three description formats
   *
   * @throws {Error} Only if productData is completely invalid (missing name)
   *
   * @remarks
   * This method is designed to be highly resilient:
   * - Attempts AI generation first using OpenRouter
   * - Automatically falls back to mock descriptions if AI fails
   * - Never throws errors for API failures (uses fallback instead)
   * - Logs errors to console for debugging
   *
   * **Usage Recommendations:**
   * - Always provide at least the product name
   * - Include categories and metadata for better AI-generated content
   * - Use "professional" style for technical products
   * - Use "sales-focused" for marketing/promotional content
   * - Use "casual" for consumer-friendly products
   *
   * @example
   * ```typescript
   * const service = new ProductDescriptionGeneratorService({
   *   apiKey: process.env.OPENROUTER_API_KEY
   * });
   *
   * // Basic usage
   * const result = await service.generateDescription(
   *   { name: "Laptop Pro", sku: "LP-2024" },
   *   { style: "professional", language: "en" }
   * );
   *
   * console.log(result.shortDescription);  // Brief product overview
   * console.log(result.longDescription);   // Detailed HTML description
   * console.log(result.metaDescription);   // SEO-optimized meta tag
   *
   * // With full product data
   * const detailedResult = await service.generateDescription(
   *   {
   *     name: "Organic Coffee Beans",
   *     sku: "COFFEE-001",
   *     metadata: { origin: "Colombia", roast: "Medium" },
   *     categories: [{ name: "Coffee" }, { name: "Organic" }],
   *     collections: [{ name: "Premium Collection" }]
   *   },
   *   { style: "sales-focused", language: "pl" }
   * );
   * ```
   */
  public async generateDescription(productData: any, config: GenerationConfig): Promise<GeneratedDescription> {
    return this.generateWithFallback(productData, config);
  }
}
