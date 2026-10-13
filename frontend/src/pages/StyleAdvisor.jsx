import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Lightbulb, 
  ShieldCheck, 
  ShoppingBag, 
  Palette, 
  Layers,
  ArrowRight
} from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import aiApi from '../api/ai';
import { useWardrobe } from '../hooks/useWardrobe';
import { getImageUrl } from '../api/clothes';

const SAMPLE_PROMPTS = [
  "How should I style my cashmere knit for a client presentation?",
  "What essentials should I buy next to complete my capsule wardrobe?",
  "Can you evaluate the color harmony of my current collection?",
  "Suggest a smart-casual date night combination with layers",
];

export const StyleAdvisor = () => {
  const { clothes } = useWardrobe();
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hello! I am your AuraStyle AI Stylist. I have analyzed your 12 cataloged pieces, your color palette, and wear frequency. How can I help you elevate your aesthetic or resolve a styling dilemma today?",
      suggestedItems: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'gaps'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load gap analysis
    aiApi.getGapAnalysis().then(data => setGapAnalysis(data));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (customText) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await aiApi.askAdvisor(textToSend, messages, clothes);
      
      // Resolve suggested items if any
      const resolvedItems = (response.suggestedItemIds || [])
        .map(id => clothes.find(c => c.id === id))
        .filter(Boolean);

      const aiResponse = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: response.reply,
        suggestedItems: resolvedItems,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      const errorMsg = {
        id: 'err_' + Date.now(),
        sender: 'ai',
        text: "I experienced a minor connection hiccup with the styling server, but rest assured: prioritizing tonal consistency and silhouettes that flatter your proportions will never go out of style!",
        suggestedItems: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-white tracking-tight flex items-center gap-2">
            <span>AuraStyle AI Advisor</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal wardrobe stylist consultations and precision gap analysis
          </p>
        </div>

        <div className="flex items-center p-1.5 rounded-2xl bg-dark-800 border border-white/10">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stylist Chat
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'gaps'
                ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wardrobe Gap Analysis
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        /* Chat Interface */
        <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-fashion flex flex-col h-[calc(80vh-120px)] min-h-[550px]">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                  msg.sender === 'user'
                    ? 'bg-pink-600 shadow-glow-pink'
                    : 'bg-gradient-to-tr from-brand-purple to-purple-600 shadow-glow-purple'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`space-y-2 ${msg.sender === 'user' ? 'items-end' : ''}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-brand-purple to-pink-600 text-white rounded-tr-none'
                      : 'bg-dark-800 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className={`block text-[10px] mt-2 font-mono ${
                      msg.sender === 'user' ? 'text-pink-200' : 'text-slate-400'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Garment Recommendations inside message */}
                  {msg.suggestedItems && msg.suggestedItems.length > 0 && (
                    <div className="p-3 bg-dark-900/60 rounded-2xl border border-white/10 mt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-300 mb-2">
                        Referenced Wardrobe Pieces:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {msg.suggestedItems.map((piece) => (
                          <div
                            key={piece.id}
                            className="flex items-center gap-2 p-1.5 rounded-xl bg-dark-800 border border-white/5"
                          >
                            <img
                              src={getImageUrl(piece.image_path)}
                              alt={piece.name}
                              className="w-10 h-12 object-cover rounded-lg"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {piece.name}
                              </p>
                              <span className="text-[10px] text-purple-300 capitalize">
                                {piece.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 bg-dark-800 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="p-3 px-6 bg-dark-800/50 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Suggested:
            </span>
            {SAMPLE_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-all flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 sm:p-6 pt-3 bg-dark-800 border-t border-white/[0.06] flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask for styling tips, outfit coordination, or capsule advice..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-dark-900 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputText.trim() || isTyping}
              leftIcon={Send}
            >
              Send
            </Button>
          </form>
        </div>
      ) : (
        /* Wardrobe Gap Analysis Tab */
        <div className="space-y-6">
          {gapAnalysis ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Missing Essentials & Recommendations */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-fashion">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-brand-purple to-pink-500 text-white shadow-glow-purple">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Missing Capsule Essentials
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400">
                        AI identifies high-impact pieces that would unlock maximum pairings
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {gapAnalysis.missingEssentials.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl bg-dark-800/80 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              item.priority === 'High' 
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {item.priority} Priority
                            </span>
                            <Badge category={item.category} size="xs" />
                          </div>
                          <h4 className="text-base font-bold text-white">
                            {item.item}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {item.reason}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendMessage(`Tell me how to pick the best ${item.item} for my wardrobe`)}
                          rightIcon={ArrowRight}
                        >
                          Stylist Advice
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Color Harmony Card */}
                <div className="bg-dark-700/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-fashion">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-glow-pink">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Chromatic Harmony Evaluation
                      </h3>
                      <p className="text-xs text-slate-400">
                        Dominant palette alignment & recommended accent tones
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {gapAnalysis.colorHarmony.recommendation}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Dominant Base Hues
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {gapAnalysis.colorHarmony.dominant.map((color, idx) => (
                          <span key={idx} className="text-xs bg-dark-900 px-3 py-1.5 rounded-xl border border-white/10 text-white font-medium">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider block mb-2">
                        Complementary Accents
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {gapAnalysis.colorHarmony.accent.map((color, idx) => (
                          <span key={idx} className="text-xs bg-dark-900 px-3 py-1.5 rounded-xl border border-pink-500/30 text-pink-200 font-medium">
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Score & Seasonal Balance */}
              <div className="space-y-6">
                {/* Health Score */}
                <div className="bg-gradient-to-br from-brand-purple/20 via-dark-700/80 to-pink-500/10 border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-fashion">
                  <span className="text-xs font-bold uppercase tracking-widest text-pink-400">
                    Wardrobe Efficiency
                  </span>
                  <div className="my-6">
                    <div className="text-5xl font-black text-white font-display">
                      {gapAnalysis.wardrobeHealthScore}%
                    </div>
                    <p className="text-xs text-purple-300 font-semibold mt-1">
                      Versatility Index Score
                    </p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Your collection demonstrates high interchangeability. 8 out of 10 items pair seamlessly with at least 3 other pieces.
                  </p>
                </div>

                {/* Seasonal Breakdown */}
                <div className="bg-dark-700/80 border border-white/[0.08] rounded-3xl p-6 shadow-fashion">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>Seasonal Preparedness</span>
                  </h4>

                  <div className="space-y-3.5">
                    {Object.entries(gapAnalysis.seasonalBalance).map(([season, percentage]) => (
                      <div key={season}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="capitalize font-medium text-slate-300">{season}</span>
                          <span className="font-bold text-white">{percentage}%</span>
                        </div>
                        <div className="w-full bg-dark-900 rounded-full h-2 overflow-hidden border border-white/5">
                          <div
                            className="bg-gradient-to-r from-brand-purple to-brand-pink h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <LoadingSpinner size="lg" label="Computing capsule metrics..." />
          )}
        </div>
      )}
    </div>
  );
};

export default StyleAdvisor;
