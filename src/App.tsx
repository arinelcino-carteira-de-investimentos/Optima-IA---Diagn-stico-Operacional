import { useState, useEffect } from "react";
import { QuizState, DiagnosticResult } from "./types";
import { 
  STEP_1_TEAM_CHOICES,
  STEP_2_CONTROL_CHOICES,
  STEP_2_TIME_CHOICES,
  STEP_3_PAIN_CHOICES,
  STEP_3_LOST_SALES_CHOICES,
  STEP_4_IMPACT_CHOICES,
  STEP_5_BEST_TIME_CHOICES,
  STEPS_CONFIG
} from "./data/quizData";
import StepProgress from "./components/StepProgress";
import NotificationBadge from "./components/NotificationBadge";
import ReportView from "./components/ReportView";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  Sparkles, 
  AlertCircle, 
  Brain, 
  Settings, 
  Check, 
  Copy, 
  X, 
  Eye, 
  Activity,
  Award
} from "lucide-react";

const INITIAL_STATE: QuizState = {
  companyName: "",
  sector: "",
  teamSize: "",
  currentControls: [],
  manualTime: "",
  painPoints: [],
  lostSales: "",
  priorityResolve: "",
  impactMeaning: "",
  userName: "",
  userWhatsApp: "",
  bestTime: "",
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [state, setState] = useState<QuizState>(() => {
    const saved = localStorage.getItem("optima_quiz_state") || localStorage.getItem("criaia_quiz_state");
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  
  const [consultantPhone, setConsultantPhone] = useState<string>(() => {
    return localStorage.getItem("optima_consultant_phone") || localStorage.getItem("criaia_consultant_phone") || "551499532580"; // A default commercial phone for Optima
  });

  const [clarityProjectId, setClarityProjectId] = useState<string>(() => {
    return localStorage.getItem("optima_clarity_project_id") || localStorage.getItem("criaia_clarity_project_id") || "";
  });

  const [isDevMenuOpen, setIsDevMenuOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [reportData, setReportData] = useState<DiagnosticResult | null>(() => {
    const saved = localStorage.getItem("criaia_report_result");
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic Injecting Microsoft Clarity tracking code natively to monitor user dropout
  useEffect(() => {
    if (clarityProjectId.trim()) {
      localStorage.setItem("optima_clarity_project_id", clarityProjectId);
      localStorage.setItem("criaia_clarity_project_id", clarityProjectId);
      
      // Inject script if not exists to avoid duplicate tracking scripts
      const scriptId = "microsoft-clarity-env-script";
      let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = scriptId;
        scriptEl.type = "text/javascript";
        scriptEl.innerHTML = `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityProjectId.trim()}");
        `;
        document.head.appendChild(scriptEl);
      }
    } else {
      localStorage.removeItem("optima_clarity_project_id");
      localStorage.removeItem("criaia_clarity_project_id");
      const scriptEl = document.getElementById("microsoft-clarity-env-script");
      if (scriptEl) {
        scriptEl.remove();
      }
    }
  }, [clarityProjectId]);

  // Persist states across reloads securely
  useEffect(() => {
    localStorage.setItem("optima_quiz_state", JSON.stringify(state));
    localStorage.setItem("criaia_quiz_state", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem("optima_consultant_phone", consultantPhone);
    localStorage.setItem("criaia_consultant_phone", consultantPhone);
  }, [consultantPhone]);

  useEffect(() => {
    if (reportData) {
      localStorage.setItem("optima_report_result", JSON.stringify(reportData));
      localStorage.setItem("criaia_report_result", JSON.stringify(reportData));
    } else {
      localStorage.removeItem("optima_report_result");
      localStorage.removeItem("criaia_report_result");
    }
  }, [reportData]);

  // Mask helper for Brazil phone numbers (99) 99999-9999 or (99) 9999-9999
  const handlePhoneInput = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    let formatted = "";
    
    if (numeric.length > 0) {
      formatted = `(${numeric.slice(0, 2)}`;
      if (numeric.length > 2) {
        formatted += `) ${numeric.slice(2, 7)}`;
        if (numeric.length > 7) {
          formatted += `-${numeric.slice(7, 11)}`;
        }
      }
    }
    setState(prev => ({ ...prev, userWhatsApp: formatted }));
  };

  const handleCheckboxToggle = (field: "currentControls" | "painPoints", value: string, limit?: number) => {
    setState(prev => {
      const currentList = [...prev[field]];
      const index = currentList.indexOf(value);
      
      if (index > -1) {
        currentList.splice(index, 1);
      } else {
        if (limit && currentList.length >= limit) {
          return prev; // Limit checkboxes selection (ex: Max 3 painPoints)
        }
        currentList.push(value);
      }
      return { ...prev, [field]: currentList };
    });
  };

  const validateStep = (stepNum: number): boolean => {
    setErrorMsg(null);
    switch (stepNum) {
      case 1:
        if (!state.companyName.trim()) {
          setErrorMsg("Por favor, preencha o Nome da empresa.");
          return false;
        }
        if (!state.sector.trim()) {
          setErrorMsg("Por favor, preencha o ramo de atuação.");
          return false;
        }
        if (!state.teamSize) {
          setErrorMsg("Selecione a quantidade de pessoas que trabalham na operação.");
          return false;
        }
        return true;

      case 2:
        if (state.currentControls.length === 0) {
          setErrorMsg("Selecione ao menos um método de controle atual.");
          return false;
        }
        if (!state.manualTime) {
          setErrorMsg("Selecione o tempo diário estimado em processos repetitivos.");
          return false;
        }
        return true;

      case 3:
        if (state.painPoints.length === 0) {
          setErrorMsg("Selecione ao menos 1 item que mais te incomoda na operação.");
          return false;
        }
        if (!state.lostSales) {
          setErrorMsg("Informe se já perdeu faturamento por desorganização.");
          return false;
        }
        return true;

      case 4:
        if (!state.priorityResolve.trim()) {
          setErrorMsg("Descreva o que você gostaria de resolver em primeiro lugar.");
          return false;
        }
        if (!state.impactMeaning) {
          setErrorMsg("Selecione o significado que essa solução trará para o seu negócio.");
          return false;
        }
        return true;

      case 5:
        if (!state.userName.trim()) {
          setErrorMsg("Por favor, informe seu nome.");
          return false;
        }
        const cleanedPhoneNumber = state.userWhatsApp.replace(/\D/g, "");
        if (cleanedPhoneNumber.length < 10) {
          setErrorMsg("Por favor, informe um WhatsApp válido com DDD.");
          return false;
        }
        if (!state.bestTime) {
          setErrorMsg("Selecione o melhor horário para entrarmos em contato.");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Step progression
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setErrorMsg(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    if (confirm("Deseja realmente reiniciar todo o diagnóstico operacional? Suas respostas serão apagadas.")) {
      setState(INITIAL_STATE);
      setReportData(null);
      setCurrentStep(1);
      setErrorMsg(null);
    }
  };

  const submitDiagnosis = async () => {
    if (!validateStep(5)) return;
    
    setLoading(true);
    setLoadingMessage("Mapeando processos e analisando gargalos operacionais...");
    
    // Aesthetic cycle of messages during loading
    const messages = [
      "Mapeando processos e analisando gargalos operacionais...",
      "Calculando desperdício diário em tarefas manuais...",
      "Consultando inteligência artificial da Optima...",
      "Estruturando seu Plano de Ação enxuto sob medida...",
      "Quase pronto! Organizando templates e propostas..."
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 1800);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(state),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar diagnóstico operacional automatizado.");
      }

      const result: DiagnosticResult = await response.json();
      setReportData(result);
      setCurrentStep(6); // Step 6 is the Report Dashboard view
    } catch (error: any) {
      console.error(error);
      setErrorMsg("Ocorreu uma instabilidade ao conectar com o servidor da Optima. Por favor, tente enviar novamente.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f5f8] flex flex-col justify-center items-center py-6 px-4 sm:px-6 font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* Liquid Crystal Ambient iOS Backdrop Aura Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left soft emerald liquid crystal */}
        <div className="absolute -top-[12%] -left-[10%] w-[550px] h-[550px] rounded-full bg-emerald-400/18 blur-[110px] animate-float-1"></div>
        {/* Mid-right glowing azure orb */}
        <div className="absolute top-[25%] -right-[15%] w-[600px] h-[600px] rounded-full bg-cyan-400/15 blur-[130px] animate-float-2"></div>
        {/* Bottom-left royal lavender crystal glow */}
        <div className="absolute bottom-[5%] -left-[15%] w-[580px] h-[580px] rounded-full bg-indigo-400/12 blur-[120px] animate-float-1"></div>
        {/* Center ambient coral glow */}
        <div className="absolute top-[50%] left-[25%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-300/8 blur-[100px] animate-float-2"></div>
        
        {/* Fine sub-pixel high-tech grid of the liquid crystal screen */}
        <div className="absolute inset-0 bg-[radial-gradient(#d1d5db_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.35]"></div>
      </div>

      <div className="relative w-full max-w-2xl z-10 my-auto">
        {/* Animated full screen overlay loading loader */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/92 p-6 text-center text-white backdrop-blur-xl"
            >
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-blue-600/25"></div>
                <div className="absolute h-18 w-18 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500"></div>
                <Sparkles className="h-8 w-8 text-lime-400 animate-pulse" />
              </div>
              <h3 className="mt-8 font-sans text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Gerando Diagnóstico Operacional
              </h3>
              <p className="mx-auto mt-3 max-w-md font-sans text-sm text-slate-400">
                {loadingMessage}
              </p>
              <span className="mt-8 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Optima · Motores Inteligentes Ativados
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {reportData && currentStep === 6 ? (
          <ReportView 
            result={reportData} 
            onReset={handleReset} 
            recipientPhone={consultantPhone} 
          />
        ) : (
          <div className="space-y-4 animate-fade-in">
            
            {/* DYNAMIC FORM SHELL COMPONENT - FULL IMMERSIVE KIOSK */}
            <div className="rounded-3xl glass-panel p-5 sm:p-7 shadow-2xl relative overflow-hidden">
              
              {/* Highlight glossy overlay gloss effect like old Apple crystal glass */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/35 to-transparent rounded-t-3xl"></div>

              {/* INTEGRATED HEADLINE BRAND & ETHICAL BRIBE HEADER */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/20 mb-4 relative z-10">
                <div 
                  className="flex items-center gap-2 cursor-pointer select-none transition-transform active:scale-[0.98]"
                  onClick={handleReset}
                  title="Clique para reiniciar o formulário"
                >
                  <div className="flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-1.5 text-white shadow-md border border-slate-800">
                    <svg className="h-4.5 w-4.5 animate-pulse shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="url(#logoBlueGrad)" strokeWidth="2.5" className="opacity-90" />
                      <path d="M7 17L17 7M17 7H12M17 7V12" stroke="url(#logoLimeGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      <defs>
                        <linearGradient id="logoBlueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#1d4ed8" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                        <linearGradient id="logoLimeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#84cc16" />
                          <stop offset="100%" stopColor="#a3e635" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="font-sans text-2xs font-extrabold tracking-tight">
                      OPTIMA<span className="text-[#a3e635]">.</span>
                    </span>
                  </div>
                  <span className="hidden xs:inline-block font-mono text-[9px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50/70 px-1.5 py-0.5 rounded-sm">
                    Eficiência Máxima
                  </span>
                </div>

                {/* Suborno Ético / Ethical Bribe Reward Tag */}
                <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 font-sans text-[10px] font-bold text-blue-700 shadow-3xs">
                  <Award className="h-3.5 w-3.5 text-blue-600 animate-bounce" />
                  <span>PREMIAÇÃO ATIVA</span>
                </div>
              </div>

              {/* PROGRESS INDICATION BAR */}
              <div className="mb-4">
                <StepProgress currentStep={currentStep} />
              </div>

              {/* DARK CONTEXT COMPONENT HOOK */}
              <div className="mb-4">
                <NotificationBadge step={currentStep} />
              </div>

              {/* Heading description with "Suborno Ético" expectations alignment */}
              {currentStep === 1 && (
                <div className="mb-4.5 p-4 rounded-2xl bg-gradient-to-br from-blue-50/45 to-indigo-50/20 border border-blue-100/25 relative z-10">
                  <h2 className="font-sans text-sm font-extrabold tracking-tight text-slate-900 sm:text-base leading-snug">
                    Resgate seu <span className="text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-md">Diagnóstico de Eficiência + Protótipo Gratuito</span> de presente!
                  </h2>
                  <p className="mt-2 text-3xs leading-relaxed text-slate-500 font-medium">
                    Nosso time mapeará os vazamentos de faturamento e gargalos de sua operação e desenhará uma solução ideal. Responda 5 rápidas etapas para destravar sua recompensa!
                  </p>
                  
                  {/* Highlights countdown banner */}
                  <div className="mt-2.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-2 rounded-xl font-sans text-[10px] text-slate-700 font-bold flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span><strong className="text-blue-950 font-bold">Leva só 3 minutos:</strong> Quanto mais sincera a resposta, mais valioso será o seu prêmio.</span>
                  </div>
                </div>
              )}

              {/* Subheading stage identifier */}
              <div className="mb-6 relative z-10">
                <span className="font-mono text-2xs font-extrabold uppercase tracking-widest text-blue-800 bg-blue-100/50 px-2.5 py-1 rounded-full border border-blue-200/40">
                  {STEPS_CONFIG[currentStep]?.subtitle}
                </span>
                
                <h3 className="mt-4 font-sans text-lg font-bold text-slate-900 sm:text-xl">
                  {currentStep === 1 && "Primeiro, me conta quem é você no mercado."}
                  {currentStep === 2 && "Como você controla o negócio hoje?"}
                  {currentStep === 3 && "O que mais te incomoda na operação hoje?"}
                  {currentStep === 4 && "Se uma coisa fosse resolvida amanhã, qual seria?"}
                  {currentStep === 5 && "Pra quem enviamos o diagnóstico gratuito?"}
                </h3>
              </div>

              {/* Subtitle helper box quote */}
              <div className="mb-6 border-l-2 border-blue-500 pl-4 bg-white/40 border border-slate-200/20 py-3 rounded-r-2xl shadow-xs">
                <p className="font-sans text-xs leading-relaxed text-slate-500 font-medium italic">
                  {currentStep === 1 && "Cada segmento tem uma dor diferente. Saber o seu é o que permite criar um sistema sob medida — e não um pacote genérico."}
                  {currentStep === 2 && "É aqui que 90% dos empresários descobrem que estão perdendo dinheiro sem perceber. Não existe resposta errada — existe resposta sincera."}
                  {currentStep === 3 && "O sistema que vamos desenhar ataca exatamente o que você marcar aqui. Por isso, marque o que realmente dói de forma transparente."}
                  {currentStep === 4 && "A resposta dessa etapa define a primeira funcionalidade do seu sistema. Direto na dor, sem enfeite ou botões desnecessários."}
                  {currentStep === 5 && "Você recebe pelo WhatsApp uma análise da sua operação + a proposta de um sistema enxuto, desenhado pra resolver exatamente o que você marcou aqui."}
                </p>
              </div>

              {/* STEP 1 FIELDS */}
              {currentStep === 1 && (
                <div className="space-y-6 relative z-10">
                  <div>
                    <label htmlFor="companyName" className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nome da empresa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={state.companyName}
                      onChange={e => setState({ ...state, companyName: e.target.value })}
                      placeholder="Ex: Minha Empresa Ltda"
                      className="mt-2 w-full rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="sector" className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Qual é o seu ramo? <span className="text-rose-500">*</span>
                      <span className="ml-1 text-2xs font-normal text-slate-400 capitalize">(ex: loja de roupas, oficina, restaurante, clínica...)</span>
                    </label>
                    <input
                      type="text"
                      id="sector"
                      value={state.sector}
                      onChange={e => setState({ ...state, sector: e.target.value })}
                      placeholder="Ex: Oficina Mecânica"
                      className="mt-2 w-full rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/15 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quantas pessoas trabalham na operação hoje? <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {STEP_1_TEAM_CHOICES.map(choice => {
                        const isSel = state.teamSize === choice.value;
                        return (
                          <div
                            key={choice.value}
                            onClick={() => setState({ ...state, teamSize: choice.value as any })}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isSel ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isSel ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? "border-blue-600 bg-blue-600" : "border-slate-300"
                            }`}>
                              {isSel && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 FIELDS */}
              {currentStep === 2 && (
                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Onde estão as informações da sua empresa hoje? <span className="text-2xs font-normal text-slate-400 lowercase">(marque todas que se aplicam)</span> <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5">
                      {STEP_2_CONTROL_CHOICES.map(choice => {
                        const isChecked = state.currentControls.includes(choice.value);
                        return (
                          <div
                            key={choice.value}
                            onClick={() => handleCheckboxToggle("currentControls", choice.value)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isChecked ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isChecked ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                            }`}>
                              {isChecked && (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Quanto tempo por dia você (ou sua equipe) gasta com tarefas manuais e repetitivas? <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5">
                      {STEP_2_TIME_CHOICES.map(choice => {
                        const isSel = state.manualTime === choice.value;
                        return (
                          <div
                            key={choice.value}
                            onClick={() => setState({ ...state, manualTime: choice.value as any })}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isSel ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isSel ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                            }`}>
                              {isSel && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 FIELDS */}
              {currentStep === 3 && (
                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Onde você sente que mais perde dinheiro ou cliente hoje? <span className="text-2xs font-normal text-slate-400 lowercase">(marque até 3)</span> <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5">
                      {STEP_3_PAIN_CHOICES.map(choice => {
                        const isChecked = state.painPoints.includes(choice.value);
                        return (
                          <div
                            key={choice.value}
                            onClick={() => handleCheckboxToggle("painPoints", choice.value, 3)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isChecked ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isChecked ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                            }`}>
                              {isChecked && (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Você já perdeu uma venda ou um cliente por causa de desorganização? <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5">
                      {STEP_3_LOST_SALES_CHOICES.map(choice => {
                        const isSel = state.lostSales === choice.value;
                        return (
                          <div
                            key={choice.value}
                            onClick={() => setState({ ...state, lostSales: choice.value as any })}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isSel ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isSel ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                            }`}>
                              {isSel && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 FIELDS */}
              {currentStep === 4 && (
                <div className="space-y-6 relative z-10">
                  <div>
                    <label htmlFor="priorityResolve" className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Descreva com suas palavras: o que você resolveria primeiro? <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="priorityResolve"
                      rows={4}
                      value={state.priorityResolve}
                      onChange={e => setState({ ...state, priorityResolve: e.target.value })}
                      placeholder="Ex: parar de perder pedido no WhatsApp, saber quanto entra e sai por dia, cronograma para a equipe..."
                      className="mt-2 w-full rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      O que esse problema resolvido significaria pra você? <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5">
                      {STEP_4_IMPACT_CHOICES.map(choice => {
                        const isSel = state.impactMeaning === choice.value;
                        return (
                          <div
                            key={choice.value}
                            onClick={() => setState({ ...state, impactMeaning: choice.value as any })}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isSel ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isSel ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                            }`}>
                              {isSel && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5 FIELDS */}
              {currentStep === 5 && (
                <div className="space-y-6 relative z-10">
                  <div>
                    <label htmlFor="userName" className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Seu nome <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="userName"
                      value={state.userName}
                      onChange={e => setState({ ...state, userName: e.target.value })}
                      placeholder="Ex: Agenor B."
                      className="mt-2 w-full rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label htmlFor="userWhatsApp" className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Seu WhatsApp (com DDD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="userWhatsApp"
                      value={state.userWhatsApp}
                      onChange={e => handlePhoneInput(e.target.value)}
                      placeholder="(99) 99999-9999"
                      maxLength={15}
                      className="mt-2 w-full rounded-xl border border-slate-300/50 bg-white/50 px-4 py-3.5 font-mono text-sm font-medium transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
                      Melhor horário pra conversarmos? <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      {STEP_5_BEST_TIME_CHOICES.map(choice => {
                        const isSel = state.bestTime === choice.value;
                        return (
                          <div
                            key={choice.value}
                            onClick={() => setState({ ...state, bestTime: choice.value as any })}
                            className={`flex cursor-pointer items-center justify-between rounded-xl px-4 py-3.5 ${
                              isSel ? "glass-card-selected" : "glass-card-interactive"
                            }`}
                          >
                            <span className={`font-sans text-xs font-bold ${isSel ? "text-slate-900" : "text-slate-700"}`}>
                              {choice.label}
                            </span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                              isSel ? "border-emerald-500 bg-emerald-500" : "border-slate-300"
                            }`}>
                              {isSel && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC ERROR WARNING */}
              {errorMsg && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-300/20 bg-rose-500/10 p-4 text-xs text-rose-950 font-semibold backdrop-blur-xs shadow-xs animate-fade-in relative z-10">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                  <p className="font-sans leading-normal">{errorMsg}</p>
                </div>
              )}

              {/* STEP NAVIGATION BUTTONS (Precision iOS Pill Style) */}
              <div className="mt-8 flex justify-between gap-3 border-t border-slate-200/30 pt-6 relative z-10">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex h-12.5 items-center justify-center gap-2 rounded-full border border-slate-300/40 bg-white/40 px-6 font-sans text-xs font-bold text-slate-700 transition-all hover:bg-white hover:text-slate-900 active:scale-[0.96] shadow-xs active:shadow-inner"
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                    Voltar
                  </button>
                ) : (
                  <div></div> /* Spacer placeholder */
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex h-12.5 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 font-sans text-xs font-bold text-white shadow-lg shadow-emerald-950/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 active:translate-y-0 active:scale-[0.96]"
                  >
                    Continuar
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitDiagnosis}
                    className="inline-flex h-12.5 items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 font-sans text-xs font-bold text-white shadow-lg shadow-emerald-950/15 transition-all hover:-translate-y-0.5 hover:bg-emerald-600 active:translate-y-0 active:scale-[0.96]"
                  >
                    Receber diagnóstico gratuito ✓
                  </button>
                )}
              </div>

            </div>

            {/* BRAND FOOTER (Slightly translucent matching the backdrop) */}
            <footer className="text-center pb-4 relative z-10">
              <p className="font-sans text-[11px] font-medium leading-relaxed text-slate-400">
                Optima · Soluções Digitais para Negócios Locais — Sistemas enxutos, direto na dor.
              </p>
            </footer>

          </div>
        )}
      </div>

      {/* FLOAT CONSULTANT & ANALYTICS FLYOUT PANEL */}
      <div className="fixed bottom-4 right-4 z-40 font-sans">
        <AnimatePresence>
          {isDevMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="absolute bottom-12 right-0 w-80 rounded-3xl bg-slate-900 p-5 text-white shadow-2xl border border-slate-800 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Gloss sheet decoration */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/10 to-transparent"></div>
              
              <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-blue-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="font-sans text-[10px] font-black uppercase tracking-wider">Painel do Consultor Optima</span>
                </div>
                <button 
                  onClick={() => setIsDevMenuOpen(false)}
                  className="rounded-full bg-slate-800 p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-4 relative z-10 text-xs text-slate-300">
                
                {/* Consultant phone number control */}
                <div>
                  <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    WhatsApp Comercial de Destino:
                  </label>
                  <input
                    type="text"
                    value={consultantPhone}
                    onChange={(e) => setConsultantPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ex: 551499532580"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[11px] font-bold text-white transition-all focus:border-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[9px] text-slate-500 mt-1 block font-medium leading-normal">
                    Número de telefone que recebe os relatórios estruturados quando o usuário clica em enviar via WhatsApp.
                  </span>
                </div>

                {/* Microsoft Clarity Integration Setup */}
                <div className="border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">
                      ID Microsoft Clarity / Funil:
                    </label>
                    <span className="text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-sm">Rastreio Ativo</span>
                  </div>
                  <input
                    type="text"
                    value={clarityProjectId}
                    onChange={(e) => setClarityProjectId(e.target.value.trim())}
                    placeholder="Cole seu ID Clarity (ex: py3f8b9z)"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-[11px] font-bold text-white transition-all focus:border-emerald-500 focus:outline-hidden"
                  />
                  
                  {/* Dynamic validation badge */}
                  {clarityProjectId.trim() ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] text-emerald-400 font-bold leading-normal">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Snippet Clarity injetado e rastreando!</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-amber-500 mt-1 block font-medium leading-normal">
                      Para rastrear abandono da etapa 1 à 5, insira seu ID do Microsoft Clarity. Gravações reais e mapas de calor serão ativados instantaneamente!
                    </span>
                  )}
                </div>

                {/* Funnel tracking advise */}
                <div className="border-t border-slate-800 pt-2.5 bg-slate-950/40 p-2 rounded-xl border border-slate-850">
                  <h4 className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                    <Activity className="h-3 w-3 animate-pulse" /> Monitoramento de Queda
                  </h4>
                  <p className="text-[9px] leading-relaxed text-slate-400 mt-0.5">
                    Clarity gera mapas de calor e mostra gravações reais dos usuários preenchendo as etapas para você identificar atritos.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsDevMenuOpen(!isDevMenuOpen)}
          className={`flex h-10 items-center gap-2 rounded-full px-4 shadow-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.95] border ${
            isDevMenuOpen 
              ? "bg-slate-900 border-slate-800 text-white" 
              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Settings className={`h-4 w-4 ${isDevMenuOpen ? "text-emerald-400 rotate-45" : "text-slate-500"}`} />
          {isDevMenuOpen ? "Fechar Painel" : "Painel do Consultor ⚙️"}
        </button>
      </div>

    </div>
  );
}
