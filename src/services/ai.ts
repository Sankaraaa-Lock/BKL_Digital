import { GoogleGenAI } from "@google/genai";

// Initialization with lazy loading for security environment variable
let genAI: GoogleGenAI | null = null;

const getAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const chatWithAI = async (messages: { role: 'user' | 'model', text: string }[]) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are the AI assistant for PT. BPR Kreo Lestari, a regional developmental bank in Indonesia. Your tone is professional, helpful, and trustworthy. Answer user questions based on the provided context if available. If you don't know the answer, say you don't know but offer to connect them with a representative."
    }
  });

  const lastMessage = messages[messages.length - 1].text;
  const history = messages.slice(0, -1).map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));

  const response = await chat.sendMessage({
    message: lastMessage,
    // Add history if needed, but SDK handles it if we pass it to create? 
    // Actually ai.chats.create takes history.
  });

  return response.text;
};

export const searchInDocuments = async (query: string, documentContexts: string[]) => {
  const ai = getAI();
  const context = documentContexts.join("\n\n---\n\n");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following documents, answer the query: "${query}"\n\nDocuments Content:\n${context}`,
    config: {
      systemInstruction: "You are an expert document analysis assistant for PT. BPR Kreo Lestari. Use only the provided document text to answer questions. If the information is not in the documents, state that clearly."
    }
  });

  return response.text;
};
