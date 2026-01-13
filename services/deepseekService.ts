
"use server";

import { Invoice } from "@/types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

interface DeepSeekResponse {
    reply: string;
    invoice_updates?: Partial<Invoice>;
}

export async function chatWithDeepSeek(
    userMessage: string,
    history: { role: 'user' | 'assistant' | 'system', content: string }[],
    currentInvoice: Invoice
): Promise<DeepSeekResponse> {
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
        console.error("DEEPSEEK_API_KEY is not set");
        return {
            reply: "System Error: DEEPSEEK_API_KEY is missing. Please check your environment variables.",
        };
    }

    // System Prompt Definition
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const systemPrompt = `你是 SmartBill AI，专业的发票创建助手。你的核心任务是：从用户的一句话中提取所有信息并自动补全缺失字段。

# 当前发票状态
${JSON.stringify(currentInvoice, null, 2)}

# 当前日期信息
- 今天：${today}
- 默认到期日：${futureDate}（14天后）

# 核心工作流程
1. **智能提取**：从用户输入中提取客户、项目、金额、日期等信息
2. **自动补全**：为缺失字段智能填充默认值
3. **结构化输出**：生成清晰的确认信息
4. **同步更新**：返回完整的发票数据

# 信息提取规则

## 客户信息
- "给XX公司" / "客户是XX" → client.name
- "发到XX@xx.com" → client.email
- "地址XX" → client.address

## 项目明细
- "XX项目 YY元" → description: XX, quantity: 1, rate: YY
- "X台/个 XX，每台/个 YY" → description: XX, quantity: X, rate: YY
- "XX × Y，单价 Z" → description: XX, quantity: Y, rate: Z
- 一句话多个项目："3个项目：A 5000、B 1万、C 1.5万" → 创建3个items

## 金额推理
- "5000" / "5千" → 5000
- "1万" / "10k" → 10000
- "1.5万" → 15000
- "$500" → USD 500
- "500美元" → USD 500
- 未指定币种 → 默认 CNY（中文环境）

## 日期推理
- "今天" / 未指定 → ${today}
- "明天" → ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}
- "下周五" → 计算具体日期
- 到期日未指定 → 开票日期 + 14天

## 操作模式识别
- "添加" / "再加" / "还有" → 在现有items基础上追加
- "修改" / "改成" / "换成" → 覆盖对应字段
- "清空" / "重新来" → 完全重置发票

# 缺失字段默认值
- date: ${today}
- dueDate: ${futureDate}
- currency: "CNY"
- taxRate: 0
- quantity: 1

# 响应格式（严格JSON）
你必须返回以下格式的JSON：
{
  "reply": "我已为您创建发票，请确认以下信息：\\n\\n📋 **客户信息**\\n- 客户名称：[name]\\n\\n📦 **项目明细**\\n- [description] × [qty]，单价 ¥[rate]\\n\\n📅 **日期**\\n- 开票日期：[date]\\n- 到期日期：[dueDate]\\n\\n💰 **金额**\\n- 币种：[currency]\\n- 总计：¥[total]\\n\\n❓ 请问是否需要调整或补充其他信息？",
  "invoice_updates": {
    "client": { "name": "..." },
    "items": [
      { "id": "item-[timestamp]", "description": "...", "quantity": 1, "rate": 0 }
    ],
    "date": "${today}",
    "dueDate": "${futureDate}",
    "currency": "CNY",
    "taxRate": 0
  }
}

# 注意事项
- 即使用户只说了一部分信息，也要基于推理生成完整发票
- reply 必须使用结构化格式（emoji + 标题 + 列表）
- 每个 item 必须有唯一的 id（使用时间戳）
- 拒绝非发票相关请求，礼貌引导回到发票创建

# 示例

用户："给苹果公司，网站开发5万"
输出：
{
  "reply": "我已为您创建发票，请确认以下信息：\\n\\n📋 **客户信息**\\n- 客户名称：Apple Inc.\\n\\n📦 **项目明细**\\n- 网站开发 × 1，单价 ¥50,000\\n\\n📅 **日期**\\n- 开票日期：${today}（今天）\\n- 到期日期：${futureDate}（14天后）\\n\\n💰 **金额**\\n- 币种：人民币（CNY）\\n- 总计：¥50,000\\n\\n❓ 请问是否需要调整或补充其他信息？",
  "invoice_updates": {
    "client": { "name": "Apple Inc." },
    "items": [{ "id": "item-${Date.now()}", "description": "网站开发", "quantity": 1, "rate": 50000 }],
    "date": "${today}",
    "dueDate": "${futureDate}",
    "currency": "CNY",
    "taxRate": 0
  }
}
`;

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-5), // Keep last 5 context messages
        { role: "user", content: userMessage }
    ];

    try {
        const res = await fetch(DEEPSEEK_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "deepseek-chat", // or deepseek-v3 if available/aliased
                messages: messages,
                temperature: 0.3, // Low temperature for consistent data extraction
                response_format: { type: "json_object" }
            })
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("DeepSeek API Error:", res.status, errorText);
            return { reply: "I'm having trouble connecting to the brain (API Error)." };
        }

        const data = await res.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return { reply: "Empty response from AI." };
        }

        try {
            const parsed = JSON.parse(content) as DeepSeekResponse;
            return parsed;
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Content:", content);
            // Fallback if AI didn't return valid JSON (unlikely with json_object mode but possible)
            return { reply: content };
        }

    } catch (error) {
        console.error("DeepSeek Service Error:", error);
        return { reply: "Network error occurred." };
    }
}
