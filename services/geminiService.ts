"use server";

import { GoogleGenAI, Type } from "@google/genai";

export async function smartGenerateLineItems(description: string) {
  // 必须使用命名参数初始化
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return null;
  }
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个专业的财务助手。请将以下业务描述转换为标准的发票明细项（包含描述、数量和单价）。
      描述内容："${description}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "项目描述" },
              quantity: { type: Type.NUMBER, description: "数量" },
              rate: { type: Type.NUMBER, description: "单价" },
            },
            required: ["description", "quantity", "rate"],
          },
        },
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}
