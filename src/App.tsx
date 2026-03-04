/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Download,
  ChevronRight,
  Loader2,
  Palette,
  Type,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRESET_STYLES = [
  {
    id: "cyberpunk",
    name: "賽博朋克",
    prompt:
      "Transform this image into a neon-lit cyberpunk style with glowing accents and futuristic vibes.",
  },
  {
    id: "vangogh",
    name: "梵谷油畫",
    prompt:
      "Transform this image into an oil painting in the style of Vincent van Gogh, with thick brushstrokes and swirling patterns.",
  },
  {
    id: "ghibli",
    name: "吉卜力動漫",
    prompt:
      "Transform this image into a beautiful Studio Ghibli anime style with soft colors and hand-drawn aesthetic.",
  },
  {
    id: "sketch",
    name: "鉛筆素描",
    prompt:
      "Transform this image into a detailed pencil sketch with fine lines and realistic shading.",
  },
  {
    id: "vaporwave",
    name: "蒸汽波",
    prompt:
      "Transform this image into a 1980s vaporwave aesthetic with pink and blue gradients, glitch effects, and retro-futuristic elements.",
  },
];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [customStyle, setCustomStyle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "正在分析照片...",
    "正在套用藝術筆觸...",
    "正在調配完美色彩...",
    "Gemini 正在構思您的風格...",
    "正在完成傑作...",
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setTransformedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleTransform = async () => {
    if (!originalImage) return;

    const stylePrompt =
      selectedStyle === "custom"
        ? `Transform this image into: ${customStyle}`
        : PRESET_STYLES.find((s) => s.id === selectedStyle)?.prompt;

    if (!stylePrompt) {
      setError("Please select a style or enter a custom one.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Cycle through loading messages
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingMessage(loadingMessages[msgIndex % loadingMessages.length]);
      msgIndex++;
    }, 2500);
    setLoadingMessage(loadingMessages[0]);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "undefined") {
      setError("找不到 API Key。請確保 .env.local 檔案中設定了 GEMINI_API_KEY。");
      setIsProcessing(false);
      clearInterval(interval);
      return;
    }

    
    while (currentModelIndex < modelsToTry.length && !foundImage) {
      try {
        const model = "gemini-2.5-flash-image";
        const ai = new GoogleGenAI({ apiKey });

        // Extract base64 data
        const base64Data = originalImage.split(',')[1];
        const mimeType = originalImage.split(';')[0].split(':')[1];

        const response = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
              {
                text: stylePrompt,
              },
            ],
          },
        });

        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
          for (const part of candidates[0].content.parts) {
            if (part.inlineData) {
              const resultBase64 = part.inlineData.data;
              setTransformedImage(`data:image/png;base64,${resultBase64}`);
              foundImage = true;
              break;
            }
          }
        }

        if (!foundImage) {
          // If we tried all models and still no image
          if (currentModelIndex === modelsToTry.length - 1) {
            throw new Error("模型未生成影像結果。請換一個風格試試。");
          }
          // Otherwise continue to next model
          currentModelIndex++;
        }

      } catch (err: any) {
        console.error(`Error with model ${modelsToTry[currentModelIndex]}:`, err);
        console.error("Full error details:", JSON.stringify(err, null, 2));
        
        const isQuotaError = err.message?.includes("429") || 
                             err.status === "RESOURCE_EXHAUSTED" ||
                             (err.error && err.error.code === 429);
        
        const isNotFoundError = err.message?.includes("404") || 
                                err.status === "NOT_FOUND" ||
                                (err.error && err.error.code === 404);
        
        // If it's a quota error or a "not found" (maybe the model name changed), try fallback
        if ((isQuotaError || isNotFoundError) && currentModelIndex < modelsToTry.length - 1) {
          console.log(`Model ${modelsToTry[currentModelIndex]} failed (${err.status || 'ERROR'}), falling back...`);
          currentModelIndex++;
          continue;
        }

        if (isQuotaError) {
          setError("您的照片轉換配額已用盡（429 錯誤）。這通常是因為免費版 API 的限制。請稍候幾分鐘再試。");
        } else if (isNotFoundError) {
          setError(`模型 ${modelsToTry[currentModelIndex]} 目前不可用 (404)。請確認您的 API Key 是否支援此模型。`);
        } else {
          setError(err.message || "轉換過程中發生錯誤，請稍後再試。");
        }
        break; // Exit the while loop on error
      }
    }

    clearInterval(interval);
    setIsProcessing(false);
  };

  const reset = () => {
    setOriginalImage(null);
    setTransformedImage(null);
    setSelectedStyle(null);
    setCustomStyle("");
    setError(null);
  };

  const downloadImage = () => {
    if (!transformedImage) return;
    const link = document.createElement("a");
    link.href = transformedImage;
    link.download = `stylemorph-${selectedStyle || "custom"}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-[#E7E5E4]">
      {/* Header */}
      <header className="border-b border-[#E7E5E4] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1C1917] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">
              StyleMorph AI
            </h1>
          </div>
          {originalImage && (
            <button
              onClick={reset}
              className="text-sm font-medium text-[#78716C] hover:text-[#1C1917] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column: Controls */}
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E] mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                1. 上傳照片
              </h2>

              <div
                onClick={triggerUpload}
                className={cn(
                  "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden aspect-video flex flex-col items-center justify-center bg-white",
                  originalImage
                    ? "border-[#E7E5E4]"
                    : "border-[#D6D3D1] hover:border-[#1C1917] hover:bg-[#FAFAF9]",
                )}
              >
                {originalImage ? (
                  <>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-medium flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        更換照片
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-12 h-12 bg-[#F5F5F4] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-[#78716C]" />
                    </div>
                    <p className="text-[#1C1917] font-medium">點擊或拖曳上傳</p>
                    <p className="text-[#78716C] text-sm mt-1">
                      支援 JPG, PNG, WEBP
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </section>

            <section
              className={cn(
                "transition-opacity duration-300",
                !originalImage && "opacity-50 pointer-events-none",
              )}
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E] mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                2. 選擇風格
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={cn(
                      "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                      selectedStyle === style.id
                        ? "bg-[#1C1917] border-[#1C1917] text-white shadow-lg shadow-black/10"
                        : "bg-white border-[#E7E5E4] text-[#44403C] hover:border-[#D6D3D1]",
                    )}
                  >
                    {style.name}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedStyle("custom")}
                  className={cn(
                    "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-2",
                    selectedStyle === "custom"
                      ? "bg-[#1C1917] border-[#1C1917] text-white shadow-lg shadow-black/10"
                      : "bg-white border-[#E7E5E4] text-[#44403C] hover:border-[#D6D3D1]",
                  )}
                >
                  <Type className="w-4 h-4" />
                  自定義
                </button>
              </div>

              <AnimatePresence>
                {selectedStyle === "custom" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <textarea
                      placeholder="描述你想要的風格（例如：「充滿雨水的未來霓虹城市」或「19世紀的木炭畫」）"
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      className="w-full bg-white border border-[#E7E5E4] rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1917]/10 focus:border-[#1C1917] transition-all min-h-[100px] resize-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <button
              onClick={handleTransform}
              disabled={
                !originalImage ||
                (!selectedStyle && !customStyle) ||
                isProcessing
              }
              className={cn(
                "w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-xl",
                isProcessing
                  ? "bg-[#A8A29E] cursor-not-allowed"
                  : "bg-[#1C1917] hover:bg-[#292524] active:scale-[0.98] shadow-black/10",
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  處理中...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  開始轉換
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Result */}
          <div className="relative">
            <div className="sticky top-28">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E] mb-4 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                生成結果
              </h2>

              <div className="aspect-square rounded-3xl bg-white border border-[#E7E5E4] overflow-hidden relative shadow-inner">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                    >
                      <div className="relative w-24 h-24 mb-6">
                        <div className="absolute inset-0 border-4 border-[#F5F5F4] rounded-full" />
                        <div className="absolute inset-0 border-4 border-[#1C1917] rounded-full border-t-transparent animate-spin" />
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[#1C1917]" />
                      </div>
                      <p className="text-lg font-medium text-[#1C1917]">
                        {loadingMessage}
                      </p>
                      <p className="text-sm text-[#78716C] mt-2 italic">
                        這可能需要長達 30 秒的時間
                      </p>
                    </motion.div>
                  ) : transformedImage ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="h-full w-full group"
                    >
                      <img
                        src={transformedImage}
                        alt="Transformed"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-6 right-6 flex gap-2">
                        <button
                          onClick={downloadImage}
                          className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#1C1917] p-3 rounded-xl shadow-lg transition-all active:scale-90"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full w-full flex flex-col items-center justify-center text-[#A8A29E] p-12 text-center"
                    >
                      <div className="w-16 h-16 border-2 border-dashed border-[#D6D3D1] rounded-2xl flex items-center justify-center mb-4">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <p className="font-medium">轉換後的圖片將顯示在此處</p>
                      <p className="text-sm mt-1">上傳照片並選擇風格以開始</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {transformedImage && !isProcessing && (
                <div className="mt-6 flex items-center justify-between p-4 bg-white border border-[#E7E5E4] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#E7E5E4]">
                      <img
                        src={originalImage!}
                        alt="Original thumb"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">
                        已套用風格
                      </p>
                      <p className="text-sm font-medium text-[#1C1917]">
                        {selectedStyle === "custom"
                          ? "自定義風格"
                          : PRESET_STYLES.find((s) => s.id === selectedStyle)
                              ?.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleTransform}
                    className="text-sm font-semibold text-[#1C1917] hover:underline flex items-center gap-1"
                  >
                    再試一次
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-[#E7E5E4] mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">
              由 Gemini 2.0 Flash 提供技術支援
            </span>
          </div>
          <p className="text-sm text-[#78716C]">
            &copy; {new Date().getFullYear()} StyleMorph AI. 版權所有。
          </p>
        </div>
      </footer>
    </div>
  );
}
