export interface RadioOption {
  value: string;
  label: string;
}

export interface CheckboxOption {
  value: string;
  label: string;
}

export const STEP_1_TEAM_CHOICES: RadioOption[] = [
  { value: 'so_eu', label: 'Só eu' },
  { value: '2_5', label: '2 a 5 pessoas' },
  { value: '6_15', label: '6 a 15 pessoas' },
  { value: 'mais_15', label: 'Mais de 15' },
];

export const STEP_2_CONTROL_CHOICES: CheckboxOption[] = [
  { value: 'papel', label: 'Papel ou caderno' },
  { value: 'whatsapp', label: 'Conversas do WhatsApp' },
  { value: 'planilha', label: 'Planilha (Excel / Google)' },
  { value: 'sistema_ruim', label: 'Um sistema, mas que não me atende' },
  { value: 'cabeca', label: 'Na minha cabeça mesmo' },
];

export const STEP_2_TIME_CHOICES: RadioOption[] = [
  { value: 'menos_1h', label: 'Menos de 1 hora' },
  { value: '1_2h', label: '1 a 2 horas' },
  { value: '3_4h', label: '3 a 4 horas' },
  { value: 'dia_inteiro', label: 'O dia inteiro, praticamente' },
];

export const STEP_3_PAIN_CHOICES: CheckboxOption[] = [
  { value: 'desorganizacao', label: 'Desorganização de pedidos e vendas' },
  { value: 'demora_resposta', label: 'Demora pra responder cliente' },
  { value: 'estoque', label: 'Estoque que nunca bate' },
  { value: 'financeiro', label: 'Financeiro sem controle (não sei quanto lucro)' },
  { value: 'prazos', label: 'Esquecimento de prazos e agendamentos' },
  { value: 'retrabalho', label: 'Retrabalho — a equipe faz a mesma coisa duas vezes' },
  { value: 'dependencia', label: 'Tudo depende de mim — não consigo me afastar' },
];

export const STEP_3_LOST_SALES_CHOICES: RadioOption[] = [
  { value: 'sim_varias', label: 'Sim, mais de uma vez' },
  { value: 'sim_ja', label: 'Sim, já aconteceu' },
  { value: 'talvez', label: 'Acho que sim, mas não tenho como saber' },
  { value: 'nao', label: 'Não' },
];

export const STEP_4_IMPACT_CHOICES: RadioOption[] = [
  { value: 'tempo_livre', label: 'Mais tempo livre pra cuidar do que importa' },
  { value: 'mais_lucro', label: 'Mais lucro no fim do mês' },
  { value: 'equipe_rodando', label: 'Equipe rodando sem depender de mim' },
  { value: 'crescer_sem_bagunca', label: 'Poder crescer sem virar bagunça' },
];

export const STEP_5_BEST_TIME_CHOICES: RadioOption[] = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'fim_dia', label: 'Fim do dia' },
  { value: 'qualquer', label: 'Qualquer horário' },
];

export interface StepConfig {
  number: number;
  badgeText: string;
  subtitle: string;
}

export const STEPS_CONFIG: Record<number, StepConfig> = {
  1: {
    number: 1,
    badgeText: "Seja muito bem-vindo! Vamos começar mapeando a realidade inicial da sua empresa.",
    subtitle: "ETAPA 1 DE 5 · O SEU NEGÓCIO"
  },
  2: {
    number: 2,
    badgeText: "Boa. Agora vem a parte que mais importa: como a sua operação funciona de verdade no dia a dia.",
    subtitle: "ETAPA 2 DE 5 · A OPERAÇÃO HOJE"
  },
  3: {
    number: 3,
    badgeText: "Mapeamento de perdas. O que mais te incomoda na operação?",
    subtitle: "ETAPA 3 DE 5 · AS DORES"
  },
  4: {
    number: 4,
    badgeText: "Agora ficou claro. Falta pouco: queremos entender o que \"resolvido\" significa pra você.",
    subtitle: "ETAPA 4 DE 5 · A VISÃO DE RESULTADO"
  },
  5: {
    number: 5,
    badgeText: "Última etapa. Seu diagnóstico está 90% pronto. Só precisamos saber pra onde enviar.",
    subtitle: "ETAPA 5 DE 5 · RECEBER O DIAGNÓSTICO"
  }
};
