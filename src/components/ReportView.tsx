import { useState } from "react";
import { DiagnosticResult } from "../types";
import { 
  Building2, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Check, 
  ExternalLink,
  Smartphone,
  Sparkles,
  Zap,
  TrendingDown
} from "lucide-react";

interface ReportViewProps {
  result: DiagnosticResult;
  onReset: () => void;
  recipientPhone: string;
}

export default function ReportView({ result, onReset, recipientPhone }: ReportViewProps) {
  const [copied, setCopied] = useState(false);
  const [actionDone, setActionDone] = useState<Record<number, boolean>>({});

  // Formats the WhatsApp transmission URL
  const getWhatsAppUrl = () => {
    const encodedText = encodeURIComponent(result.waText);
    const cleanPhone = recipientPhone.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.waText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAction = (step: number) => {
    setActionDone(prev => ({ ...prev, [step]: !prev[step] }));
  };

  // Safe icon solver for tool suggestions
  const getToolIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "messagesquare":
      case "message":
        return <Smartphone className="h-5 w-5 text-blue-600" />;
      case "trendingup":
      case "lucro":
        return <TrendingDown className="h-5 w-5 text-blue-600 animate-pulse" />;
      case "calendar":
      case "prazos":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Zap className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 relative z-10">
      {/* Top success header */}
      <div className="text-center animate-fade-in relative z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/15 text-blue-600 shadow-lg border border-blue-600/25 relative overflow-hidden backdrop-blur-md">
          <CheckCircle className="h-9 w-9 animate-bounce text-blue-600" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/30 to-transparent"></div>
        </div>
        <h1 className="mt-4 font-sans text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          Diagnóstico Pronto!
        </h1>
        <p className="mt-2.5 text-sm text-slate-500 font-medium">
          Suas respostas foram integradas e nossa inteligência calculou os vazamentos de eficiência e faturamento do seu negócio.
        </p>
      </div>

      {/* Main Analysis Cards */}
      <div className="mt-8 space-y-6 animate-fade-in">
        
        {/* EXECUTIVE SUMMARY CARD */}
        <div className="overflow-hidden rounded-3xl glass-panel shadow-xl relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white/30 to-transparent rounded-t-3xl"></div>
          
          <div className="border-b border-white/35 bg-white/30 px-6 py-4.5">
            <h2 className="flex items-center gap-2.5 font-sans text-xs font-extrabold uppercase tracking-widest text-slate-800">
              <Building2 className="h-4.5 w-4.5 text-blue-600" />
              Visão do Consultor Virtual
            </h2>
          </div>
          <div className="p-6 relative z-10">
            <div className="relative border-l-3 border-blue-500 pl-4 bg-white/20 p-4.5 rounded-r-2xl border border-slate-200/10 shadow-xs">
              <p className="font-sans text-sm leading-relaxed text-slate-700 italic font-medium">
                "{result.summary}"
              </p>
              <div className="absolute -top-2.5 -left-[16px] bg-blue-600 text-white rounded-full p-1 shadow-md border border-white/45">
                <Sparkles className="h-2.5 w-2.5" />
              </div>
            </div>
          </div>
        </div>

        {/* METRICS & WASTES SUMMARY */}
        <div className="grid gap-4.5 sm:grid-cols-2">
          {/* Hour wastage indicator */}
          <div className="rounded-3xl glass-panel p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-amber-500/10 to-transparent"></div>
            
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-700 border border-amber-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <span className="font-sans text-2xs font-extrabold uppercase tracking-widest text-amber-900 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Tempo Desperdiçado
              </span>
            </div>
            <div className="mt-5">
              <span className="font-sans text-4xl font-black text-slate-950 tracking-tight">
                ~{result.estimatedHoursLostMonthly}h
              </span>
              <span className="ml-1 text-xs font-bold text-slate-500">/mês em retrabalho</span>
            </div>
            <p className="mt-3.5 text-2xs leading-relaxed text-slate-600 font-medium">
              Horas preciosas gastas em erros e cliques duplicados que deveriam ser usadas para vender mais ou curtir tempo livre com a família.
            </p>
          </div>

          {/* Money wastage indicator */}
          <div className="rounded-3xl glass-panel p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-rose-500/10 to-transparent"></div>
            
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-700 border border-rose-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="font-sans text-2xs font-extrabold uppercase tracking-widest text-rose-900 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                Perda Mensal Estimada
              </span>
            </div>
            <div className="mt-5">
              <span className="font-sans text-3xl font-black text-slate-950 tracking-tight">
                R$ {result.estimatedMoneyLostMonthly.toLocaleString("pt-BR")}
              </span>
              <span className="ml-1 text-xs font-bold text-slate-500">/mês perdidos</span>
            </div>
            <p className="mt-3.5 text-2xs leading-relaxed text-slate-600 font-medium">
              Vazamento silencioso de faturamento causado diretamente por desorganização de pedidos, atrasos ou falhas de controle.
            </p>
          </div>
        </div>

        {/* GARGALOS CARD */}
        <div className="rounded-3xl glass-panel p-6 shadow-xl relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white/30 to-transparent rounded-t-3xl"></div>
          
          <h3 className="font-sans text-base font-extrabold text-slate-950">
            Principais Gargalos Operacionais
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Onde sua operação perde o ritmo e deixa dinheiro na mesa todos os dias.
          </p>

          <div className="mt-5 space-y-4 relative z-10">
            {result.gargalos.map((gargalo, index) => (
              <div 
                key={index}
                className="flex gap-4 rounded-2xl bg-white/40 border border-slate-300/30 p-4 transition-all hover:bg-white/75 hover:shadow-xs"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <AlertTriangle className={`h-5 w-5 ${gargalo.riskLevel === "alto" ? "text-rose-500" : "text-amber-500"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans text-sm font-extrabold text-slate-900">
                      {gargalo.title}
                    </h4>
                    <span className={`rounded-md px-2 py-0.5 text-4xs font-black uppercase tracking-wider ${
                      gargalo.riskLevel === "alto" ? "bg-rose-500/10 text-rose-700" : "bg-amber-500/10 text-amber-700"
                    }`}>
                      Risco {gargalo.riskLevel}
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 font-medium">
                    {gargalo.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RECOMENDACAO SISTEMA ENXUTO */}
        <div className="rounded-3xl glass-panel p-6 shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-blue-500/10 to-transparent rounded-t-3xl"></div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
            <h3 className="font-sans text-base font-extrabold text-slate-950">
              Arquitetura Sugerida pela Optima
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Chega de sistemas com mil botões que ninguém sabe usar. Nós sugerimos focar em módulos cirúrgicos:
          </p>

          <div className="mt-5 grid gap-3.5 sm:grid-cols-3 relative z-10">
            {result.ferramentas.map((tool, index) => (
              <div 
                key={index} 
                className="rounded-2xl border border-white/45 bg-white/50 p-4.5 text-center shadow-xs transition-transform hover:-translate-y-0.5"
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/10 text-blue-700">
                  {getToolIcon(tool.icon)}
                </div>
                <h4 className="mt-3 font-sans text-xs font-extrabold text-slate-900">
                  {tool.name}
                </h4>
                <p className="mt-2.5 text-[9px] font-medium leading-relaxed text-slate-500">
                  {tool.purpose}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STEP ACTION BLUEPRINT */}
        <div className="rounded-3xl glass-panel p-6 shadow-xl relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-white/30 to-transparent rounded-t-3xl"></div>
          
          <h3 className="font-sans text-base font-extrabold text-slate-950">
            Plano de Ação sob Medida
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Marque os passos completados abaixo para acompanhar sua evolução diária:
          </p>

          <div className="mt-5 space-y-3 relative z-10">
            {result.planoAcao.map((passo, index) => {
              const isChecked = actionDone[passo.step] || false;
              return (
                <div 
                  key={index}
                  onClick={() => toggleAction(passo.step)}
                  className={`flex cursor-pointer items-start gap-4 rounded-2xl p-4.5 transition-all ${
                    isChecked ? "glass-card-selected" : "glass-card-interactive"
                  }`}
                >
                  <button className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-350 bg-white transition-all shadow-3xs">
                    {isChecked && <Check className="h-3.6 w-3.6 text-blue-600 font-black" />}
                  </button>
                  <div className="grow">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 uppercase tracking-wider bg-blue-100/50 px-1.5 py-0.5 rounded-sm">
                        Passo {passo.step}
                      </span>
                      <h4 className={`font-sans text-xs font-extrabold ${isChecked ? "text-slate-400 line-through" : "text-slate-900"}`}>
                        {passo.title}
                      </h4>
                    </div>
                    <p className={`mt-2 text-xs leading-relaxed ${isChecked ? "text-slate-400 line-through" : "text-slate-650 font-medium"}`}>
                      {passo.action}
                    </p>
                    <p className="mt-2 text-4xs font-extrabold text-blue-850 font-sans uppercase tracking-wider bg-blue-100/50 px-2 py-0.5 rounded-md inline-block">
                      🎯 Ganho Estimado: {passo.benefit}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="rounded-3xl glass-panel-dark p-6 sm:p-8 text-center text-white shadow-2xl relative overflow-hidden">
          {/* Apple dynamic gloss sheen sheet */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/12 to-transparent"></div>
          
          <span className="font-sans text-4xs font-black uppercase tracking-widest text-lime-400 bg-lime-500/10 px-3 py-1 rounded-full border border-lime-500/20 inline-block relative z-10">
            Garanta seu Sistema Enxuto
          </span>
          <h3 className="mt-3.5 font-sans text-base font-black text-slate-100 sm:text-lg tracking-tight relative z-10">
            Diagnóstico Registrado com Sucesso!
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-xs text-slate-300 font-medium leading-relaxed relative z-10">
            Para garantir prioridade na análise da Optima e receber um protótipo visual gratuito sem compromisso, envie agora no nosso WhatsApp.
          </p>

          {/* Primary CTA (Send to WhatsApp - Elegant Gloss Capsule Pill) */}
          <div className="mt-6 flex flex-col gap-3.5 sm:flex-row sm:justify-center relative z-10">
            <a 
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12.5 items-center justify-center gap-2.5 rounded-full bg-blue-600 px-7 font-sans text-xs font-bold text-white shadow-xl shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-blue-500 active:translate-y-0 active:scale-[0.96]"
            >
              Enviar pelo WhatsApp agora
              <ArrowRight className="h-4.5 w-4.5" />
            </a>

            {/* Copy diagnosis */}
            <button
              onClick={copyToClipboard}
              className="inline-flex h-12.5 items-center justify-center gap-2.5 rounded-full border border-slate-700/60 bg-slate-800/80 px-6 font-sans text-xs font-bold text-slate-300 transition-all hover:bg-slate-700 hover:text-white active:scale-[0.96]"
            >
              {copied ? (
                <>
                  <Check className="h-4.5 w-4.5 text-lime-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4.5 w-4.5" />
                  Copiar Texto Formatado
                </>
              )}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-4xs font-bold text-slate-400 tracking-wider uppercase relative z-10">
            <span>Envia para:</span>
            <span className="font-mono font-black text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md">{recipientPhone}</span>
          </div>
        </div>

        {/* Restart diagnostic */}
        <div className="pt-4 text-center pb-8 relative z-10">
          <button 
            onClick={onReset}
            className="font-sans text-xs font-bold text-slate-500 hover:text-blue-700 transition-colors uppercase tracking-wider"
          >
            ← Refazer Diagnóstico Operacional
          </button>
        </div>
      </div>
    </div>
  );
}
