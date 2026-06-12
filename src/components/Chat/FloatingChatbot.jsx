import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, X, Bot, User, Loader2, Minus, 
  Maximize2, Mic, MicOff, ShoppingCart, TrendingUp, AlertTriangle, 
  CheckCircle2, BarChart3 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import llmService from '../../services/llmService';

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, 
  LineElement, Title, Tooltip, Legend, ArcElement
);

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre agent StockManager. Je peux analyser vos stocks, générer des commandes ou visualiser vos données. Comment puis-je vous aider ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const [lastUserMessage, setLastUserMessage] = useState('');

  useEffect(() => {
    const handleRemoteAI = async (e) => {
      const { message: remoteMsg } = e.detail;
      
      // Prevent multiple simultaneous triggers
      if (isLoading) return;

      setIsOpen(true);
      setIsMinimized(false);
      setLastUserMessage(remoteMsg);
      
      const userMessage = { role: 'user', content: remoteMsg };
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const historyToSend = messages.slice(-6); // 3 derniers échanges
        const response = await llmService.sendMessage(remoteMsg, historyToSend);
        setMessages(prev => [...prev, { role: 'assistant', content: response || "Aucune réponse reçue." }]);
      } catch (error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: error.response?.data?.message || "Désolé, je rencontre une difficulté technique pour analyser cette alerte. Veuillez réessayer.",
          isError: true 
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('open-chat-ai', handleRemoteAI);
    return () => window.removeEventListener('open-chat-ai', handleRemoteAI);
  }, [isLoading, messages]); // Re-subscribe if loading or messages change

  const handleSend = async (e) => {

    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;

    const currentMsg = message;
    setLastUserMessage(currentMsg);
    
    const userMessage = { role: 'user', content: currentMsg };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const historyToSend = messages.slice(-6); // 3 derniers échanges
      const response = await llmService.sendMessage(currentMsg, historyToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "Aucune réponse reçue." }]);
    } catch (error) {

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: error.response?.data?.message || "Désolé, je rencontre une difficulté technique actuellement.",
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (!lastUserMessage || isLoading) return;
    setMessage(lastUserMessage);
    // On simule un clic sur le bouton d'envoi après un court délai pour que le state message soit à jour
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSend(fakeEvent);
    }, 10);
  };
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Markdown-lite + Badge Parser
  const renderContent = (content, isUser = false) => {
    // Remove Action and Chart tags and their potential prefixes from text display
    let cleanText = content
      .replace(/(?:Action|Action\s*):?\s*\[ACTION:.*?\]/gi, '') // Removes "Action: [ACTION:...]"
      .replace(/\[ACTION:.*?\]/g, '')
      .replace(/\[CHART:.*?\]/g, '')
      .trim();
    
    // Fallback for action-only messages
    if (!cleanText && content.includes('[ACTION:')) {
      cleanText = "Voici les actions recommandées :";
    } else if (!cleanText && content.includes('[CHART:')) {
      cleanText = "Voici l'analyse visuelle demandée :";
    } else if (!cleanText && !isUser) {
      cleanText = "J'ai traité votre demande.";
    }

    // Simple formatting
    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className={`${isUser ? 'text-white' : 'text-blue-600'} font-black`}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      
      // Handle list items
      if (part.trim().startsWith('* ') || part.trim().startsWith('- ')) {
        return (
          <div key={i} className="pl-4 py-1.5 flex items-start gap-3">
            <span className={`w-1.5 h-1.5 rounded-full ${isUser ? 'bg-white/40' : 'bg-blue-400'} mt-1.5 shrink-0`} />
            <span className="flex-1">{part.trim().substring(2)}</span>
          </div>
        );
      }

      return part;
    });
  };

  // Action Parser
  const getActions = (content) => {
    try {
      const regex = /\[ACTION:(.*?):(.*?)\]/g;
      const actions = [];
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        actions.push({ type: match[1], params: JSON.parse(match[2]) });
      }
      
      return actions.length > 0 ? actions : null;
    } catch (e) {
      console.error("Action parse error", e);
      return null;
    }
  };

  // Chart Parser
  const getChartData = (content) => {
    try {
      const matches = content.match(/\[CHART:(.*?)\]/);
      if (!matches) return null;
      return JSON.parse(matches[1]);
    } catch (e) {
      console.error("Chart parse error", e);
      return null;
    }
  };

  const [pendingAction, setPendingAction] = useState(null);

  const handleExecuteAction = (action, params) => {
    setPendingAction({ action, params });
  };

  const confirmAction = async () => {
    const { action, params } = pendingAction;
    setPendingAction(null);
    setIsLoading(true);

    try {
      const res = await llmService.executeAction(action, params);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ ${res.message}`,
        isSystem: true 
      }]);
      toast.success("Action effectuée !");
    } catch (error) {
      toast.error("Erreur lors de l'exécution");
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ Erreur : ${error.response?.data?.message || "Impossible d'exécuter l'action."}`,
        isSystem: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chartData) => {
    if (!chartData || !chartData.data || !Array.isArray(chartData.data)) return null;

    try {
      const data = {
        labels: chartData.data.map(d => d?.label || ''),
        datasets: [{
          label: chartData.title || 'Données',
          data: chartData.data.map(d => d?.value || 0),
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(139, 92, 246, 0.6)',
          ],
          borderColor: 'rgba(255, 255, 255, 1)',
          borderWidth: 1,
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: chartData.type === 'pie', labels: { font: { size: 10 } } } },
        scales: chartData.type !== 'pie' ? { y: { beginAtZero: true, ticks: { font: { size: 8 } } }, x: { ticks: { font: { size: 8 } } } } : {}
      };

      return (
        <div className="mt-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm h-40">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">{chartData.title}</p>
          {chartData.type === 'bar' && <Bar data={data} options={options} />}
          {chartData.type === 'line' && <Line data={data} options={options} />}
          {chartData.type === 'pie' && <Pie data={data} options={options} />}
        </div>
      );
    } catch (e) {
      console.error("Chart render error", e);
      return <div className="text-[10px] text-red-500 p-2">Erreur d'affichage du graphique</div>;
    }
  };


  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '70px' : '500px',
              width: '350px'
            }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 overflow-hidden mb-6 flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-3 px-4 flex items-center justify-between text-white relative border-b border-slate-700/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20 p-[1px]">
                  <div className="w-full h-full bg-slate-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-black text-base tracking-tighter bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">SM</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-[14px] font-black tracking-tight text-white/95">StockManager IA</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400/90 font-bold uppercase tracking-widest">Surveillance active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95"><Minus size={18} /></button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 active:scale-95 text-red-400 hover:text-red-300 hover:bg-red-500/10"><X size={18} /></button>
              </div>

              {/* Custom Confirmation Overlay */}
              <AnimatePresence>
                {pendingAction && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-x-0 top-full bg-slate-800/95 backdrop-blur-md border-b border-slate-700 p-5 z-50 shadow-2xl"
                  >
                    <p className="text-sm text-slate-200 mb-4 font-medium leading-relaxed">
                      Confirmez-vous l'action : <br/><span className="text-emerald-400 font-bold text-base">
                        {pendingAction.action === 'CREATE_ORDER' ? 'Création de commande automatique' : pendingAction.action}
                      </span> ?
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={confirmAction}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 size={16} /> Confirmer
                      </button>
                      <button 
                        onClick={() => setPendingAction(null)}
                        className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold transition-all active:scale-95"
                      >
                        Annuler
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-slate-50/50 to-white/50 custom-scrollbar">
                  {messages.map((msg, index) => {
                    const action = getActions(msg.content);
                    const chart = getChartData(msg.content);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        key={index} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[88%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 mt-1 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm border ${
                            msg.role === 'user' ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white border-slate-600' : (msg.isSystem ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-400' : 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-blue-400')
                          }`}>
                            {msg.role === 'user' ? <User size={14} /> : (msg.isSystem ? <CheckCircle2 size={14} /> : <Bot size={16} />)}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className={`p-4 rounded-[20px] text-[13.5px] leading-[1.6] shadow-sm whitespace-pre-wrap ${
                              msg.role === 'user' 
                                ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm font-medium shadow-[0_4px_15px_-3px_rgba(79,70,229,0.3)]' 
                                : (msg.isSystem ? 'bg-emerald-50/80 backdrop-blur-sm text-emerald-800 border border-emerald-200/50 font-bold' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm font-medium')
                            }`}>
                              {renderContent(msg.content, msg.role === 'user')}
                              
                              {msg.isError && (
                                <button 
                                  onClick={handleRetry}
                                  className="mt-3 flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50/80 px-3 py-1.5 rounded-lg transition-colors active:scale-95"
                                >
                                  <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
                                  Réessayer
                                </button>
                              )}
                            </div>

                            {/* Actions Buttons */}
                            {Array.isArray(action) && action.map((act, i) => (
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={i}
                                onClick={() => handleExecuteAction(act.type, act.params)}
                                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-[0_4px_15px_-3px_rgba(16,185,129,0.3)] mb-2 w-full justify-center md:w-auto"
                              >
                                <ShoppingCart size={16} /> 
                                {act.type === 'CREATE_ORDER' ? `Commander ${act.params.quantite} unités` : 'Générer action'}
                              </motion.button>
                            ))}

                            {/* Charts */}
                            {chart && renderChart(chart)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/80 backdrop-blur-sm border border-slate-100 p-4 rounded-[20px] rounded-tl-sm flex items-center gap-3 shadow-sm mt-1">
                        <div className="flex gap-1.5">
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-blue-600 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                        </div>
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Analyse en cours...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100/50">
                  <div className="relative flex items-center gap-3">
                    <div className="relative flex-1 group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Posez votre question ou dictez-la..."
                        className="w-full pl-5 pr-12 py-3.5 bg-slate-100/50 hover:bg-slate-100/80 rounded-2xl text-[14px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white border border-transparent focus:border-indigo-100 transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                          isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className="p-3.5 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-2xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-[0_4px_15px_-3px_rgba(79,70,229,0.3)] group"
                    >
                      <Send size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-[20px] flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all duration-500 ${
          isOpen ? 'bg-slate-900 text-white rotate-90 rounded-[28px]' : 'bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 text-white hover:shadow-[0_15px_50px_-10px_rgba(79,70,229,0.6)]'
        }`}
      >
        {isOpen ? <X size={24} className="-rotate-90 transition-transform duration-500" /> : <div className="relative"><MessageSquare size={24} /><span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-[2px] border-white rounded-full animate-pulse" /></div>}
      </motion.button>
    </div>
  );
};

export default FloatingChatbot;
