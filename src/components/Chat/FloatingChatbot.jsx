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
  const renderContent = (content) => {
    // Remove Action and Chart tags from text display
    let cleanText = content.replace(/\[ACTION:.*?\]/g, '').replace(/\[CHART:.*?\]/g, '').trim();
    
    // Simple formatting
    const parts = cleanText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-blue-700 font-black">{part.slice(2, -2)}</strong>;
      }
      // Handle "badges" (simulated with specific keywords or custom syntax if IA uses it)
      if (part.includes('u.') || part.includes('unités')) {
        return <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold mx-0.5 border border-blue-100">{part}</span>;
      }
      return part;
    });
  };

  // Action Parser
  const getActions = (content) => {
    try {
      const matches = content.match(/\[ACTION:(.*?):(.*?)\]/);
      if (!matches) return null;
      return { type: matches[1], params: JSON.parse(matches[2]) };
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
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '60px' : '550px',
              width: '380px'
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-4 flex flex-col transition-all duration-300"
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Agent IA StockManager</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Actionable AI active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><Minus size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors"><X size={16} /></button>
              </div>

              {/* Custom Confirmation Overlay */}
              <AnimatePresence>
                {pendingAction && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-x-0 top-full bg-slate-800 border-b border-slate-700 p-4 z-50 shadow-xl"
                  >
                    <p className="text-xs text-slate-300 mb-3 font-medium">
                      Confirmez-vous l'action : <span className="text-emerald-400 font-bold">
                        {pendingAction.action === 'CREATE_ORDER' ? 'Création de commande automatique' : pendingAction.action}
                      </span> ?
                    </p>
                    <div className="flex gap-2">
                      <button 
                        onClick={confirmAction}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={14} /> Confirmer
                      </button>
                      <button 
                        onClick={() => setPendingAction(null)}
                        className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95"
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {messages.map((msg, index) => {
                    const action = getActions(msg.content);
                    const chart = getChartData(msg.content);
                    
                    return (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center shadow-sm ${
                            msg.role === 'user' ? 'bg-blue-600 text-white' : (msg.isSystem ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-800 text-white')
                          }`}>
                            {msg.role === 'user' ? <User size={14} /> : (msg.isSystem ? <CheckCircle2 size={14} /> : <Bot size={14} />)}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : (msg.isSystem ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none')
                            }`}>
                              {renderContent(msg.content)}
                              
                              {msg.isError && (
                                <button 
                                  onClick={handleRetry}
                                  className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
                                >
                                  <Loader2 size={12} className={isLoading ? 'animate-spin' : ''} />
                                  Réessayer
                                </button>
                              )}
                            </div>

                            
                            {/* Actions Buttons */}
                            {action && action.type === 'CREATE_ORDER' && (
                              <button 
                                onClick={() => handleExecuteAction(action.type, action.params)}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-100"
                              >
                                <ShoppingCart size={14} /> Générer le bon de commande
                              </button>
                            )}

                            {/* Charts */}
                            {chart && renderChart(chart)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-3 rounded-2xl flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-400">Analyse des stocks...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Posez votre question ou dictez-la..."
                        className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-xl text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-transparent transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                          isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-blue-600'
                        }`}
                      >
                        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-200"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X size={28} /> : <div className="relative"><MessageSquare size={28} /><span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" /></div>}
      </motion.button>
    </div>
  );
};

export default FloatingChatbot;
