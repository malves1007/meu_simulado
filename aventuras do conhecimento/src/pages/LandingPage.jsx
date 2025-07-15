import React from 'react';
import { useNavigate } from 'react-router-dom';
// [CORREÇÃO] Usando o caminho relativo correto e apontando para o ficheiro .js
import { UserPlusIcon, DatabaseIcon, BarChartIcon, SettingsIcon, SwordsIcon } from '../components/icons/index.js';

// [CORREÇÃO] O componente agora usa o hook useNavigate para a navegação
const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="font-['Poppins',_sans-serif] bg-[#0a092d] text-[#e0e0e0] overflow-x-hidden">
            {/* Adicionando estilos diretamente no JSX para os gradientes e efeitos */}
            <style>{`
                .hero-bg {
                    background-color: #0a092d;
                    background-image: radial-gradient(circle at 10% 20%, rgb(90, 92, 106) 0%, rgb(32, 45, 58) 81.3%);
                }
                .gradient-text {
                    background: -webkit-linear-gradient(45deg, #a855f7, #ec4899);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.1), 0 10px 10px -5px rgba(168, 85, 247, 0.04);
                }
                .cta-button-glow {
                    box-shadow: 0 0 15px rgba(236, 72, 153, 0.5), 0 0 30px rgba(168, 85, 247, 0.3);
                }
            `}</style>

            {/* Cabeçalho da página */}
            <header className="bg-slate-900/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">Aventuras<span className="text-purple-400"> do Conhecimento</span></h1>
                    <div className="flex items-center space-x-4">
                        <a href="#features" className="hidden sm:block text-gray-300 hover:text-white transition">Funcionalidades</a>
                        <a href="#testimonials" className="hidden sm:block text-gray-300 hover:text-white transition">Depoimentos</a>
                        <button onClick={() => navigate('/login')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-lg shadow-purple-500/20">
                            Acessar
                        </button>
                    </div>
                </nav>
            </header>

            {/* Botão de login flutuante para telas pequenas */}
            <button onClick={() => navigate('/login')} className="lg:hidden fixed bottom-5 right-5 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center">
                <UserPlusIcon className="w-6 h-6" />
            </button>

            {/* Conteúdo principal */}
            <main>
                {/* Seção principal de chamada (Hero) */}
                <section className="hero-bg pt-32 pb-20 min-h-screen flex items-center">
                    <div className="container mx-auto px-6 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                                A <span className="gradient-text">Revolução</span> nos Seus Estudos Começa Agora.
                            </h2>
                            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Pare de apenas ler. Comece a vencer. Com a nossa plataforma, transforma teoria em prática, identifica as suas fraquezas e conquista a aprovação.
                            </p>
                            <button onClick={() => navigate('/login')} className="cta-button-glow bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-10 rounded-lg text-lg transition transform hover:scale-105">
                                QUERO TESTAR GRÁTIS
                            </button>
                        </div>
                    </div>
                </section>

                {/* Seção de funcionalidades */}
                <section id="features" className="py-20 bg-slate-900">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h3 className="text-4xl font-bold text-white">Por que somos a <span className="gradient-text">melhor escolha</span>?</h3>
                            <p className="text-gray-400 mt-2">Ferramentas poderosas para um aprendizado eficaz.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="card-hover bg-slate-800 p-8 rounded-xl border border-slate-700 text-center"><div className="flex justify-center mb-4"><div className="bg-purple-600/20 p-4 rounded-full"><DatabaseIcon className="text-purple-400 w-8 h-8" /></div></div><h4 className="text-xl font-bold text-white mb-2">Banco de Questões</h4><p className="text-gray-400">Milhares de questões de provas anteriores e inéditas, sempre atualizadas.</p></div>
                            <div className="card-hover bg-slate-800 p-8 rounded-xl border border-slate-700 text-center"><div className="flex justify-center mb-4"><div className="bg-pink-600/20 p-4 rounded-full"><BarChartIcon className="text-pink-400 w-8 h-8" /></div></div><h4 className="text-xl font-bold text-white mb-2">Análise de Desempenho</h4><p className="text-gray-400">Gráficos e relatórios detalhados para focar onde realmente importa.</p></div>
                            <div className="card-hover bg-slate-800 p-8 rounded-xl border border-slate-700 text-center"><div className="flex justify-center mb-4"><div className="bg-orange-600/20 p-4 rounded-full"><SettingsIcon className="text-orange-400 w-8 h-8" /></div></div><h4 className="text-xl font-bold text-white mb-2">Simulados Personalizados</h4><p className="text-gray-400">Crie simulados com as matérias, assuntos e tempo que definir.</p></div>
                            <div className="card-hover bg-slate-800 p-8 rounded-xl border border-slate-700 text-center"><div className="flex justify-center mb-4"><div className="bg-teal-600/20 p-4 rounded-full"><SwordsIcon className="text-teal-400 w-8 h-8" /></div></div><h4 className="text-xl font-bold text-white mb-2">Modo Competição</h4><p className="text-gray-400">Desafie os seus amigos e veja quem está no topo do ranking.</p></div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Rodapé da página */}
            <footer className="bg-slate-900 border-t border-slate-800">
                <div className="container mx-auto px-6 py-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Aventuras do Conhecimento. Todos os direitos reservados.</p>
                    <p className="text-sm mt-2">Feito com para os futuros aprovados.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
