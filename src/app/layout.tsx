import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JARVIS - Personal AI Assistant",
  description: "Advanced AI-powered PC assistant with voice commands, system monitoring, and intelligent responses",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Exo 2', sans-serif;
            background: #000000;
            color: #FFD700;
            overflow-x: hidden;
          }
          
          .jarvis-font {
            font-family: 'Orbitron', monospace;
          }
          
          .glow-text {
            text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700;
          }
          
          .glow-border {
            border: 1px solid #FFD700;
            box-shadow: 0 0 10px #FFD700, inset 0 0 10px rgba(255, 215, 0, 0.1);
          }
          
          .pulse-animation {
            animation: pulse 2s infinite;
          }
          
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
          
          .slide-in {
            animation: slideIn 0.5s ease-out;
          }
          
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          
          .fade-in {
            animation: fadeIn 1s ease-in;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .hologram-effect {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 50%, rgba(255, 215, 0, 0.1) 100%);
            border: 1px solid rgba(255, 215, 0, 0.3);
            backdrop-filter: blur(5px);
          }
          
          .scanning-line {
            position: relative;
            overflow: hidden;
          }
          
          .scanning-line::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
            animation: scan 3s infinite;
          }
          
          @keyframes scan {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          
          .matrix-bg {
            background-image: 
              radial-gradient(circle at 1px 1px, rgba(255, 215, 0, 0.1) 1px, transparent 0);
            background-size: 20px 20px;
          }
          
          .circuit-pattern {
            background-image: 
              linear-gradient(90deg, rgba(255, 215, 0, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px);
            background-size: 30px 30px;
          }
          
          .hover-glow:hover {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
            transform: scale(1.02);
            transition: all 0.3s ease;
          }
          
          .status-online {
            color: #00FF00;
            text-shadow: 0 0 10px #00FF00;
          }
          
          .status-processing {
            color: #FFD700;
            text-shadow: 0 0 10px #FFD700;
          }
          
          .status-error {
            color: #FF0000;
            text-shadow: 0 0 10px #FF0000;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-black text-yellow-400 matrix-bg">
        <div className="relative min-h-screen">
          {/* Background Circuit Pattern */}
          <div className="fixed inset-0 circuit-pattern opacity-20 pointer-events-none" />
          
          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>
          
          {/* Ambient Glow Effects */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl" />
          </div>
        </div>
      </body>
    </html>
  );
}