import { NextRequest, NextResponse } from 'next/server';

const languageCodes: Record<string, string> = {
  hi: 'hi',
  ta: 'ta',
  te: 'te',
  kn: 'kn',
  ml: 'ml',
  bn: 'bn',
  mr: 'mr',
  gu: 'gu',
  pa: 'pa',
  ur: 'ur',
  fr: 'fr',
  es: 'es',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh-CN',
  ar: 'ar',
};

async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    // Response format: [[["translated","original",...],...],...]
    if (data && data[0]) {
      return data[0].map((segment: any) => segment[0]).join('');
    }
    return text;
  } catch {
    return text;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { texts, targetLanguage } = await req.json();

    if (!texts || !targetLanguage) {
      return NextResponse.json({ error: 'Missing texts or targetLanguage' }, { status: 400 });
    }

    if (targetLanguage === 'en') {
      return NextResponse.json({ translations: texts });
    }

    const langCode = languageCodes[targetLanguage] || targetLanguage;

    // Translate individually in parallel batches of 8 for reliability
    const translations: string[] = [];
    const batchSize = 8;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((text: string) => translateText(text, langCode))
      );
      translations.push(...results);
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ translations: [] }, { status: 500 });
  }
}
