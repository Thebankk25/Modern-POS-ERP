
import React from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingCart, Package, BarChart2, Cpu, Database, Rocket, ShieldCheck } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300">
        <div className="flex items-center justify-center bg-slate-700/50 text-indigo-400 w-12 h-12 rounded-lg mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400">{children}</p>
    </div>
);

const Pitch: React.FC = () => {
    return (
        <div className="bg-slate-900 text-white min-h-screen antialiased">
            {/* Header */}
            <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                    <Store className="text-indigo-500" size={28} />
                    <h1 className="text-2xl font-bold">POS ERP</h1>
                </div>
                <Link to="/dashboard" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                    Launch Demo
                </Link>
            </header>

            {/* Hero Section */}
            <main className="px-6 md:px-12">
                <section className="text-center py-20 md:py-32">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-6">
                            The Smart POS for Your Business
                        </h2>
                        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            An intuitive, AI-powered Point of Sale & ERP system designed to streamline your operations, provide intelligent insights, and fuel your growth.
                        </p>
                        <Link to="/dashboard" className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-indigo-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-indigo-500/30 inline-block">
                            <span className="flex items-center justify-center"><Rocket size={20} className="mr-2"/> Try the Live Demo</span>
                        </Link>
                    </div>
                </section>

                {/* Visual Preview */}
                <section className="py-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-slate-800 rounded-xl p-2 md:p-3 border border-slate-700 shadow-2xl shadow-black/30">
                            <div className="flex items-center gap-1.5 p-2 md:p-3 border-b border-slate-700">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <img src="https://i.imgur.com/gKImT4g.png" alt="POS ERP Dashboard" className="w-full h-auto rounded-b-lg object-cover" />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 md:py-28">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl md:text-4xl font-bold text-white">Everything You Need to Succeed</h3>
                            <p className="text-lg text-slate-400 mt-2">A comprehensive toolset to manage your business effectively.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard icon={<ShoppingCart size={24} />} title="Intuitive POS">
                                A blazing fast Point of Sale interface that's easy to use for you and your staff. Supports cash and QR payments.
                            </FeatureCard>
                            <FeatureCard icon={<Package size={24} />} title="Inventory Control">
                                Real-time stock management. Get alerts for low-stock items and never miss a sale.
                            </FeatureCard>
                            <FeatureCard icon={<Cpu size={24} />} title="AI-Powered Insights">
                                Let Google Gemini summarize your daily sales, identify trends, and provide actionable insights in plain language.
                            </FeatureCard>
                             <FeatureCard icon={<Database size={24} />} title="Portable Database">
                                Your data, your control. Start with local storage and seamlessly switch to a portable SQLite database file.
                            </FeatureCard>
                            <FeatureCard icon={<BarChart2 size={24} />} title="Sales Analytics">
                                Track your performance with a detailed sales history, paginated reports, and printable receipts.
                            </FeatureCard>
                            <FeatureCard icon={<ShieldCheck size={24} />} title="Offline & Secure">
                                Designed as a Progressive Web App (PWA), it works offline. All data processing happens on your device.
                            </FeatureCard>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-800">
                <div className="text-center text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Modern POS ERP. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Pitch;
