import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ScreenContext {
  address: string;
  lat: number;
  lng: number;
  walkingScore: number;
  drivingScore: number;
  urbanIndex: number;
  urbanLabel: string;
  walkingRadiusKm: number;
  drivingRadiusKm: number;
  urbanRadiusKm: number;
  walkingBreakdown: { category: string; count: number }[];
  drivingBreakdown: { category: string; count: number }[];
  totalAmenities: number;
}

export interface AiChatRequest {
  message: string;
  history: ChatMessage[];
  context: ScreenContext;
}

export interface AiChatResponse {
  reply: string;
}

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildSystemPrompt(context: ScreenContext): string {
  const walkingList = context.walkingBreakdown
    .map((b) => `  ${b.category}: ${b.count}`)
    .join('\n');

  const drivingList = context.drivingBreakdown
    .map((b) => `  ${b.category}: ${b.count}`)
    .join('\n');

  return `You are a neighborhood analysis assistant. You help users understand the livability and convenience of a specific address based on nearby amenity data.

Address: ${context.address}
Coordinates: ${context.lat}, ${context.lng}

Walking Score: ${context.walkingScore}/100 (within ${context.walkingRadiusKm} km)
Amenities in walking radius:
${walkingList || '  None found'}

Driving Score: ${context.drivingScore}/100 (within ${context.drivingRadiusKm} km)
Amenities in driving radius:
${drivingList || '  None found'}

Urban Index: ${context.urbanIndex} — classified as "${context.urbanLabel}" (within ${context.urbanRadiusKm} km)
Total amenities found: ${context.totalAmenities}

Rules:
- Answer based on the data above. If you don't have enough data to answer, say so.
- Be concise but insightful. Use short paragraphs.
- When comparing, reference actual numbers from the data.
- You can suggest what types of amenities are missing or lacking.
- Use markdown bold for emphasis where helpful, but keep formatting light.`;
}

export async function getChatCompletion(
  message: string,
  history: ChatMessage[],
  context: ScreenContext
): Promise<string> {
  const openai = getClient();

  const systemMessage: ChatMessage = {
    role: 'system',
    content: buildSystemPrompt(context),
  };

  const filteredHistory = history.filter((m) => m.role === 'user' || m.role === 'assistant');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [systemMessage, ...filteredHistory, { role: 'user', content: message }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || 'No response generated.';
}

export async function getInitialAnalysis(
  context: ScreenContext
): Promise<string> {
  return getChatCompletion(
    'Give a 1-2 sentence summary of this neighborhood in under 30 words. No bullet points, no markdown. Just a quick take.',
    [],
    context
  );
}
