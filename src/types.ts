export interface QuizState {
  companyName: string;
  sector: string;
  teamSize: 'so_eu' | '2_5' | '6_15' | 'mais_15' | '';
  currentControls: string[]; // checkboxes
  manualTime: 'menos_1h' | '1_2h' | '3_4h' | 'dia_inteiro' | '';
  painPoints: string[]; // checkboxes
  lostSales: 'sim_varias' | 'sim_ja' | 'talvez' | 'nao' | '';
  priorityResolve: string;
  impactMeaning: 'tempo_livre' | 'mais_lucro' | 'equipe_rodando' | 'crescer_sem_bagunca' | '';
  userName: string;
  userWhatsApp: string;
  bestTime: 'manha' | 'tarde' | 'fim_dia' | 'qualquer' | '';
}

export interface Gargalo {
  title: string;
  explanation: string;
  riskLevel: 'alto' | 'medio' | 'baixo';
}

export interface ActionStep {
  step: number;
  title: string;
  action: string;
  benefit: string;
}

export interface ToolSuggestion {
  name: string;
  purpose: string;
  icon: string;
}

export interface DiagnosticResult {
  summary: string;
  estimatedHoursLostMonthly: number;
  estimatedMoneyLostMonthly: number;
  gargalos: Gargalo[];
  planoAcao: ActionStep[];
  ferramentas: ToolSuggestion[];
  waText: string;
}
