// geminiClient.js
import { GoogleGenerativeAI } from "@google/generative-ai";

//export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
export const genAI = new GoogleGenerativeAI("AIzaSyDIMvJNBRqMXkVkRXp3PE8yrHl-lBJ8u0Y");


// Example: text model
export const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
