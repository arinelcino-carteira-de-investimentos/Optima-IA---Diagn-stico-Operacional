interface NotificationBadgeProps {
  step: number;
}

export default function NotificationBadge({ step }: NotificationBadgeProps) {
  // Configured content to perfectly match the original visual design
  const getBadgeContent = () => {
    switch (step) {
      case 2:
        return (
          <>
            <span className="font-bold text-cyan-300">Boa.</span> Agora vem a parte que mais importa: como a sua operação funciona de verdade no dia a dia.
          </>
        );
      case 3:
        return (
          <>
            <span className="font-bold text-lime-300">Dói onde aperta.</span> O sistema que vamos desenhar ataca exatamente o que você marcar aqui. Por isso, marque o que realmente dói.
          </>
        );
      case 4:
        return (
          <>
            <span className="font-bold text-cyan-300">Agora ficou claro.</span> Falta pouco: queremos entender o que "resolvido" significa pra você.
          </>
        );
      case 5:
        return (
          <>
            <span className="font-bold text-lime-300">Última etapa.</span> Seu diagnóstico está 90% pronto. Só precisamos saber pra onde enviar.
          </>
        );
      default:
        return (
          <>
            <span className="font-bold text-blue-300 font-sans">Diagnóstico.</span> Responda 5 etapas rápidas para estruturar sua análise operacional automatizada sob medida.
          </>
        );
    }
  };

  return (
    <div className="rounded-2xl glass-panel-dark p-5 text-xs sm:text-sm leading-relaxed text-slate-100 shadow-2xl transition-all duration-300 animate-fade-in relative overflow-hidden">
      {/* Light sheen overlay */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-linear-to-b from-white/10 to-transparent pointer-events-none"></div>
      
      <p className="font-sans font-medium text-slate-200 relative z-10 flex items-start gap-2.5">
        <span className="text-base shrink-0 -mt-0.5 select-none">💬</span>
        <span>{getBadgeContent()}</span>
      </p>
    </div>
  );
}
