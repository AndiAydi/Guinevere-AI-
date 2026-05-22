import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "../_core/trpc";
import { GoogleGenAI } from "@google/genai"; // Import library Google 

// Inisialisasi Gemini pake API Key dari file .env
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

// Data mock status hubungan biar UI lu tetep jalan normal
let relationshipStatus = {
  relationshipLevel: 10,
  currentMode: "normal",
  happinessLevel: 50,
  totalInteractions: 0,
  hasBeenHurt: false,
};

// Wadah penyimpan riwayat chat sementara di memori laptop
let chatHistory: Array<{
  id: number;
  role: "user" | "assistant";
  content: string;
  mode: string;
  emotionalState: string;
  containsButterfly: boolean;
  createdAt: Date;
}> = [];

export const chatRouter = router({
  // 1. Ambil Status Hubungan
  getRelationshipStatus: publicProcedure.query(() => {
    return relationshipStatus;
  }),
  
  // 2. Ambil Riwayat Chat
  getHistory: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      const limit = input.limit || 20;
      return chatHistory.slice(-limit);
    }),

  // 3. Bersihkan Riwayat Chat
  clearHistory: publicProcedure.mutation(() => {
    chatHistory = [];
    return { success: true };
  }),

  // 4. KANDANG OTAK AI GUINEVERE (Kirim Pesan)
  sendMessage: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Jembatan bypass: Kalo ctx.user kosong (Guest), otomatis pake nama "Aydi"
      const currentUser = ctx.user || { id: "mock-123", name: "Aydi" };
      relationshipStatus.totalInteractions += 1;

      try {
        // Panggil model Gemini 2.5 Flash (cepet, pinter, dan hemat RAM)
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: input.message,
          // Kasih System Instruction biar dia sadar dia itu asisten meja belajar lu
          config: {
            systemInstruction: `Nama kamu adalah Guinevere AI, asisten AI yang elegan, cerdas, dan suportif. Kamu sedang menemani user bernama ${currentUser.name} di meja belajarnya untuk membantu koding, belajar olimpiade, sains, atau sekadar mengobrol. Jawab pertanyaannya dengan informatif, bijak, santun, dan berikan sedikit sentuhan hangat.`
          }
        });

        const responseText = response.text || "Aku mendengarmu, tapi aku kesulitan merangkai kata...";
        
        // Simpan chat user ke history biar nongol di UI chatbox
        const savedUserMsg = {
          id: Date.now(),
          role: "user" as const,
          content: input.message,
          mode: relationshipStatus.currentMode,
          emotionalState: "comfortable",
          containsButterfly: false,
          createdAt: new Date(),
        };

        // Simpan balasan cerdas Guinevere ke history
        const savedAssistantMsg = {
          id: Date.now() + 1,
          role: "assistant" as const,
          content: responseText,
          mode: relationshipStatus.currentMode,
          emotionalState: "comfortable",
          containsButterfly: false,
          createdAt: new Date(),
        };

        chatHistory.push(savedUserMsg, savedAssistantMsg);

        // Kembalikan data ke frontend
        return {
          message: responseText,
          mode: relationshipStatus.currentMode,
          emotionalState: "comfortable",
          containsButterfly: false,
          relationshipLevel: relationshipStatus.relationshipLevel,
        };

      } catch (error) {
        console.error("Gemini API Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Aduh Di, otak AI-ku kesandung error koneksi atau API Key belom valid nih.",
        });
      }
    }),
});