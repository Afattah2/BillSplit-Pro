
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ReceiptData } from "../types";

export const extractReceiptData = async (base64Image: string): Promise<ReceiptData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: "Analyze this receipt and extract EVERY SINGLE item listed. Do not summarize or skip any items. Extract: 1. A full list of items with their individual names and exact prices. 2. The total tax amount. 3. Any service charges or fees. 4. The grand total at the bottom. The output must be valid JSON.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                price: { type: Type.NUMBER },
              },
              required: ["name", "price"],
            },
          },
          tax: { type: Type.NUMBER },
          serviceCharge: { type: Type.NUMBER },
          total: { type: Type.NUMBER },
        },
        required: ["items", "tax", "serviceCharge", "total"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No data extracted from receipt.");
  
  const parsed = JSON.parse(text);
  
  // Add unique IDs to items
  return {
    ...parsed,
    items: parsed.items.map((item: any, idx: number) => ({
      ...item,
      id: `item-${idx}-${Date.now()}`
    }))
  };
};
