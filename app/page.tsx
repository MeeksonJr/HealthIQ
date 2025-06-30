'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Zap, Shield, Brain, Activity, Microscope, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div 
          className="absolute w-96 h-96 bg-purple-600/20 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">HealthIQ</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#about" className="hover:text-purple-400 transition-colors">About</a>
          <a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a>
          <button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-purple-600 to-red-600 px-6 py-2 rounded-full hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-red-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Health Analytics
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Revolutionize healthcare with advanced AI analysis. From medical scans to personalized insights, 
            experience the future of precision medicine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-purple-600 to-red-600 px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="border-2 border-white/20 px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all duration-300">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Physics Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-20 py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl lg:text-6xl font-bold text-center mb-16">
            Powerful <span className="text-purple-600">Features</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Medical Analysis",
                description: "Advanced machine learning algorithms analyze medical scans and provide instant insights.",
                color: "purple"
              },
              {
                icon: Microscope,
                title: "Precision Diagnostics",
                description: "High-accuracy diagnostic tools powered by cutting-edge computer vision technology.",
                color: "red"
              },
              {
                icon: Shield,
                title: "Secure & Compliant",
                description: "HIPAA-compliant platform with enterprise-grade security and privacy protection.",
                color: "purple"
              },
              {
                icon: Users,
                title: "Multi-User Roles",
                description: "Tailored experiences for patients, doctors, specialists, and healthcare administrators.",
                color: "red"
              },
              {
                icon: Activity,
                title: "Real-time Monitoring",
                description: "Continuous health monitoring with instant alerts and predictive analytics.",
                color: "purple"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Process medical data in seconds with our optimized AI infrastructure.",
                color: "red"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color === 'purple' ? 'from-purple-600 to-purple-800' : 'from-red-600 to-red-800'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-8">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Healthcare?
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of healthcare professionals already using HealthIQ to deliver better patient outcomes.
          </p>
          
          <button 
            onClick={handleGetStarted}
            className="group bg-gradient-to-r from-red-600 to-purple-600 px-12 py-6 rounded-full text-xl font-semibold hover:from-red-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <span>Get Started Today</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-red-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HealthIQ</span>
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Support</a>
              <a href="#" className="hover:text-purple-400 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
            <p>&copy; 2025 HealthIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}