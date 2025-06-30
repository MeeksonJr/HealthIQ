'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Heart, 
  Camera, 
  Pill, 
  FileText, 
  TrendingUp, 
  Settings, 
  LogOut,
  Activity,
  Calendar,
  Users,
  MessageCircle,
  X,
  Send,
  Home,
  User,
  Shield,
  Bell
} from 'lucide-react';

interface Profile {
  id: string;
  user_mode: string;
  full_name: string;
  avatar_url: string | null;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function CommandHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your HealthIQ AI assistant. I can help you with health insights, medication information, and analyzing your scans. How can I assist you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    };
    getProfile();
  }, []);

  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'purple' },
      { icon: Camera, label: 'Scans', path: '/scans', color: 'red' },
      { icon: Activity, label: 'Health Log', path: '/health-log', color: 'purple' },
      { icon: TrendingUp, label: 'Insights', path: '/insights', color: 'red' },
    ];

    switch (profile?.user_mode) {
      case 'doctor':
        return [
          ...baseItems,
          { icon: Users, label: 'Patients', path: '/patients', color: 'purple' },
          { icon: Calendar, label: 'Appointments', path: '/appointments', color: 'red' },
          { icon: FileText, label: 'Reports', path: '/reports', color: 'purple' },
        ];
      case 'teen':
        return [
          ...baseItems,
          { icon: Bell, label: 'Reminders', path: '/reminders', color: 'red' },
          { icon: Heart, label: 'Wellness', path: '/wellness', color: 'purple' },
        ];
      case 'parent':
        return [
          ...baseItems,
          { icon: Users, label: 'Family', path: '/family', color: 'purple' },
          { icon: Pill, label: 'Medications', path: '/medications', color: 'red' },
          { icon: Calendar, label: 'Appointments', path: '/appointments', color: 'purple' },
        ];
      default: // patient
        return [
          ...baseItems,
          { icon: Pill, label: 'Medications', path: '/medications', color: 'purple' },
          { icon: Calendar, label: 'Appointments', path: '/appointments', color: 'red' },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response (replace with actual AI integration later)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(inputMessage),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('medication') || lowerInput.includes('pill')) {
      return `Based on your profile, I can help you track medications. Your current medication schedule shows you have ${Math.floor(Math.random() * 3) + 1} medications to take today. Would you like me to set up reminders?`;
    }
    
    if (lowerInput.includes('scan') || lowerInput.includes('analysis')) {
      return `I see you've uploaded ${Math.floor(Math.random() * 5) + 1} scans this month. Your latest food scan shows good nutritional balance. Would you like detailed insights on any specific scan?`;
    }
    
    if (lowerInput.includes('health') || lowerInput.includes('score')) {
      return `Your current health score is ${85 + Math.floor(Math.random() * 15)}%. This is based on your recent activity, scans, and health logs. Keep up the great work with your wellness routine!`;
    }
    
    if (lowerInput.includes('appointment') || lowerInput.includes('doctor')) {
      return `I can help you manage appointments. You have ${Math.floor(Math.random() * 2) + 1} upcoming appointments. Would you like me to show you the details or help schedule a new one?`;
    }

    const responses = [
      "Based on your health profile, I recommend consulting with your healthcare provider about this.",
      "I can help you track this information in your health log. Would you like me to guide you through it?",
      "Your recent scans show positive trends. Keep up the good work with your health routine!",
      "I notice you haven't logged your medications today. Would you like a reminder?",
      "Based on your user mode and health data, here are some personalized insights for you.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <>
      {/* Command Hub Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 bg-gradient-to-br from-purple-600 to-red-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform hover:scale-110 ${
            isOpen ? 'rotate-45' : 'rotate-0'
          } animate-pulse hover:animate-none`}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <Heart className="w-8 h-8 text-white" />
          )}
        </button>

        {/* Navigation Menu */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 mb-4">
            <div className="flex flex-col space-y-3">
              {/* Chat Button */}
              <button
                onClick={() => setShowChat(!showChat)}
                className={`w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 animate-fade-in ${
                  showChat ? 'ring-4 ring-green-400/30' : ''
                }`}
                style={{ animationDelay: '0.1s' }}
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </button>

              {/* Navigation Items */}
              {navigationItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-12 h-12 bg-gradient-to-br ${
                    item.color === 'purple' 
                      ? 'from-purple-600 to-purple-800' 
                      : 'from-red-600 to-red-800'
                  } rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 animate-fade-in ${
                    pathname === item.path ? 'ring-4 ring-white/30 scale-110' : ''
                  }`}
                  style={{ animationDelay: `${(index + 2) * 0.1}s` }}
                  title={item.label}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </button>
              ))}

              {/* Settings */}
              <button
                onClick={() => {
                  router.push('/settings');
                  setIsOpen(false);
                }}
                className={`w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 animate-fade-in ${
                  pathname === '/settings' ? 'ring-4 ring-white/30 scale-110' : ''
                }`}
                style={{ animationDelay: `${(navigationItems.length + 2) * 0.1}s` }}
              >
                <Settings className="w-6 h-6 text-white" />
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 animate-fade-in"
                style={{ animationDelay: `${(navigationItems.length + 3) * 0.1}s` }}
              >
                <LogOut className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowChat(false)} />
          
          <div className="relative w-full max-w-md h-96 bg-black/90 backdrop-blur-sm border border-white/20 rounded-2xl flex flex-col animate-scale-in">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center animate-pulse">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">HealthIQ AI</h3>
                  <p className="text-xs text-gray-400">Your personal health assistant</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-in`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-purple-600 to-red-600 text-white'
                        : 'bg-white/10 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about your health..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-red-600 p-2 rounded-xl hover:from-purple-700 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}