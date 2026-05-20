"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ImagePlus, Send, Bot, User, Loader2, X, Sparkles, Paperclip, Mic, MicOff, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  image?: string;
  isInitial?: boolean;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string, image?: File) => void;
  isLoading?: boolean;
  onOpenCamera?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, onOpenCamera }) => {
  const [inputText, setInputText] = useState("");
  const [attachedImage, setAttachedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech Recognition Setup
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "en-US"; // Defaulting to English, can be dynamic

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => (prev ? prev + " " + transcript : transcript));
          setIsListening(false);
        };

        recog.onerror = () => setIsListening(false);
        recog.onend = () => setIsListening(false);

        setRecognition(recog);
      }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      setIsListening(true);
      recognition?.start();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  const handleAttachImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeAttachment = () => {
    setAttachedImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    onSendMessage(inputText, attachedImage || undefined);
    setInputText("");
    removeAttachment();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-8 scrollbar-hide"
      >
        <div className="w-full py-6 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-end gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 mb-1",
                  msg.role === "user" ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-700"
                )}>
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                
                <div className={cn(
                  "max-w-[85%] sm:max-w-[80%] px-6 py-4.5 text-[17px] md:text-[19px] lg:text-[20px] leading-relaxed shadow-md font-medium",
                  msg.role === "user" 
                    ? "bg-emerald-600 text-white rounded-[1.8rem] rounded-br-none" 
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-[1.8rem] rounded-bl-none"
                )}>
                  {msg.image && (
                    <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200/60 shadow-lg bg-slate-50">
                      <img src={msg.image} className="w-full max-h-[480px] object-contain rounded-xl" alt="Analysis" />
                    </div>
                  )}
                  <div className="prose prose-base md:prose-lg lg:prose-xl max-w-none text-inherit font-medium leading-relaxed">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-emerald-600/60 font-black uppercase tracking-[0.2em] text-[10px] pl-13"
            >
              <Loader2 size={14} className="animate-spin" />
              AI is thinking
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
        <div className="w-full">
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-3 p-2 bg-white rounded-2xl border border-slate-200 shadow-xl inline-flex items-center gap-3"
            >
              <img src={imagePreview} className="w-12 h-12 object-cover rounded-lg" alt="Attach" />
              <button onClick={removeAttachment} className="text-rose-500 text-[11px] font-bold pr-2">Remove</button>
            </motion.div>
          )}

          <div className={cn(
            "bg-white border border-slate-200 rounded-[2rem] shadow-2xl flex items-end p-2 gap-1 focus-within:border-emerald-500/50 transition-all",
            isListening && "ring-2 ring-emerald-500/30 border-emerald-500/50"
          )}>
            {/* Action Buttons */}
            <div className="flex items-center gap-0.5">
              <button 
                type="button" 
                onClick={onOpenCamera}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                title="Open Camera"
              >
                <Camera size={20} />
              </button>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-emerald-600 transition-all"
                title="Attach Photo"
              >
                <Paperclip size={20} />
              </button>
            </div>
            
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAttachImage} className="hidden" />

            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={isListening ? "Listening..." : "Message AgriGuide..."}
              className={cn(
                "flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium py-3 resize-none max-h-48",
                isListening ? "text-emerald-600 placeholder:text-emerald-400" : "text-slate-800 placeholder:text-slate-400"
              )}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <div className="flex items-center gap-1">
              <button 
                type="button"
                onClick={toggleListening}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isListening ? "bg-emerald-100 text-emerald-600 animate-pulse" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <button 
                onClick={() => handleSubmit()}
                disabled={(!inputText.trim() && !attachedImage) || isLoading}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg",
                  (!inputText.trim() && !attachedImage) || isLoading
                    ? "bg-slate-100 text-slate-300 shadow-none"
                    : "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500"
                )}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
