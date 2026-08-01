import { Groq } from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

export interface FinancialAIAnalysisInput {
  companyId: string;
  imageUrl?: string;
  audioTranscription?: string;
}

export class MultimodalFinancialEngine {
  public static async processOperationMedia(input: FinancialAIAnalysisInput) {
    const { imageUrl, audioTranscription } = input;

    const systemPrompt = `Você é um assistente inteligente de análise financeira do sistema.
Sua função é extrair dados claros sobre custos, categorias de gastos e recomendações de automação a partir de comprovantes ou de transcrições de áudio.

DIRETRIZES OBRIGATÓRIAS:
1. Retorne estritamente um JSON estruturado contendo:
   - \"action\": \"REGISTER_EXPENSE\" | \"PRICE_CALCULATION\" | \"COST_SUMMARY\"
   - \"items\": [{ \"name\": string, \"quantity\": number, \"unit\": string, \"totalCost\": number }]
   - \"summary\": \"Breve explicação do cálculo realizado\"
2. Nunca invente valores que não estejam claros na mídia ou texto fornecido.
`.trim();

    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];

      if (imageUrl) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: audioTranscription || 'Analise esta imagem de compra/comprovante:' },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        });

        const completion = await groq.chat.completions.create({
          model: 'llama-3.2-11b-vision-preview',
          messages,
          temperature: 0.1,
          max_tokens: 400,
        });

        return { success: true, analysis: completion.choices[0]?.message?.content };
      }

      if (audioTranscription) {
        messages.push({ role: 'user', content: audioTranscription });

        const completion = await groq.chat.completions.create({
          model: 'llama3-8b-8192',
          messages,
          temperature: 0.1,
          max_tokens: 300,
        });

        return { success: true, analysis: completion.choices[0]?.message?.content };
      }

      return { success: false, error: 'Nenhuma mídia ou áudio fornecido para análise.' };
    } catch (error: any) {
      console.error('Erro na Engine Multimodal Financeira:', error);
      return { success: false, error: 'Falha ao processar análise inteligente de custos.' };
    }
  }
}
