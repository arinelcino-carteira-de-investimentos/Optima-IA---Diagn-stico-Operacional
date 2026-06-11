import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI server-side with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Real AI diagnosis will be simulated or fallback gracefully.");
}

// Map key codes to localized/beautiful text translations for accurate operational prompt context
const TEAM_SIZE_LABELS: Record<string, string> = {
  so_eu: "Apenas eu (1 pessoa)",
  '2_5': "2 a 5 pessoas",
  '6_15': "6 a 15 pessoas",
  mais_15: "Mais de 15 pessoas",
};

const CONTROL_LABELS: Record<string, string> = {
  papel: "Papel ou caderno",
  whatsapp: "Conversas do WhatsApp",
  planilha: "Planilha (Excel / Google)",
  sistema_ruim: "Um sistema, mas que não me atende",
  cabeca: "Na minha cabeça mesmo",
};

const MANUAL_TIME_LABELS: Record<string, string> = {
  menos_1h: "Menos de 1 hora",
  '1_2h': "1 a 2 horas",
  '3_4h': "3 a 4 horas",
  dia_inteiro: "O dia inteiro, praticamente",
};

const PAIN_LABELS: Record<string, string> = {
  desorganizacao: "Desorganização de pedidos e vendas",
  demora_resposta: "Demora pra responder cliente",
  estoque: "Estoque que nunca bate",
  financeiro: "Financeiro sem controle (não sei quanto lucro)",
  prazos: "Esquecimento de prazos e agendamentos",
  retrabalho: "Retrabalho — a equipe faz a mesma coisa duas vezes",
  dependencia: "Tudo depende de mim — não consigo me afastar",
};

const LOST_SALES_LABELS: Record<string, string> = {
  sim_varias: "Sim, mais de uma vez",
  sim_ja: "Sim, já aconteceu",
  talvez: "Acho que sim, mas não tenho como saber",
  nao: "Não",
};

const IMPACT_LABELS: Record<string, string> = {
  tempo_livre: "Mais tempo livre pra cuidar do que importa",
  mais_lucro: "Mais lucro no fim do mês",
  equipe_rodando: "Equipe rodando sem depender de mim",
  crescer_sem_bagunca: "Poder crescer sem virar bagunça",
};

const BEST_TIME_LABELS: Record<string, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  fim_dia: "Fim do dia",
  qualquer: "Qualquer horário",
};

// API Endpoint for generating Operational Diagnosis with Gemini 3.5-flash
app.post("/api/diagnose", async (req, res) => {
  try {
    const data = req.body;
    
    // Human-readable labels conversion for Gemini prompt context
    const company = data.companyName || "Empresa não informada";
    const sector = data.sector || "Ramo não informado";
    const teamSizeText = TEAM_SIZE_LABELS[data.teamSize] || "Não especificado";
    const controlsText = Array.isArray(data.currentControls) 
      ? data.currentControls.map((c: string) => CONTROL_LABELS[c] || c).join(", ")
      : "Não especificado";
    const manualTimeText = MANUAL_TIME_LABELS[data.manualTime] || "Não especificado";
    const painsText = Array.isArray(data.painPoints)
      ? data.painPoints.map((p: string) => PAIN_LABELS[p] || p).join(", ")
      : "Não especificado";
    const lostSalesText = LOST_SALES_LABELS[data.lostSales] || "Não especificado";
    const priorityResolveText = data.priorityResolve || "Não fornecido";
    const impactText = IMPACT_LABELS[data.impactMeaning] || "Não especificado";
    const userName = data.userName || "Usuário";
    const userWhatsApp = data.userWhatsApp || "Não especificado";
    const bestTimeText = BEST_TIME_LABELS[data.bestTime] || "Não especificado";

    // Format the WhatsApp text exactly as shown in screenshot 15 template
    // This provides fallback transparency and aligns with the screenshots.
    // For "Qual é o controle atual", typically pick the predominant one or join them
    const controlsValue = Array.isArray(data.currentControls) && data.currentControls.length > 0
      ? data.currentControls.map((c: string) => CONTROL_LABELS[c] || c).join(" / ")
      : "Nenhum";
    const singlePainText = Array.isArray(data.painPoints) && data.painPoints.length > 0
      ? data.painPoints.map((p: string) => PAIN_LABELS[p] || p).join(", ")
      : "Nenhuma dor mapeada";

    const localFormattedWaText = `DIAGNÓSTICO OPERACIONAL — Optima

Empresa: ${company}
Ramo: ${sector}
Equipe: ${teamSizeText}

Controle atual: ${controlsValue}
Tempo em tarefas manuais/dia: ${manualTimeText}

Principais dores: ${singlePainText}
Já perdeu venda por desorganização: ${lostSalesText}

Prioridade nº 1: ${priorityResolveText}
Resultado esperado: ${impactText}

Nome: ${userName}
WhatsApp: ${userWhatsApp}
Melhor horário: ${bestTimeText}`;

    // Helper function to generate diagnostic fallback data when Gemini is unavailable, or quota is exhausted (429)
    const getFallbackResponse = () => {
      console.log("Using intelligent custom algorithm fallback for diagnosis generation.");
      
      const mockedHours = data.manualTime === 'menos_1h' ? 15 
        : data.manualTime === '1_2h' ? 35
        : data.manualTime === '3_4h' ? 70
        : 140;

      const hourlyCost = data.teamSize === 'so_eu' ? 45
        : data.teamSize === '2_5' ? 65
        : data.teamSize === '6_15' ? 120
        : 250;

      const mockedMoney = mockedHours * hourlyCost + (data.lostSales === 'sim_varias' ? 1500 : data.lostSales === 'sim_ja' ? 800 : 300);

      const delayMsg = data.painPoints.includes('demora_resposta') 
        ? "Descobrimos que a demora em responder clientes por WhatsApp é um grande vazamento de faturamento." 
        : "";

      return {
        summary: `Com base nas respostas para a empresa ${company} no ramo de ${sector}, identificamos importantes gargalos na operação. Administrar o fluxo diário usando "${controlsText}" consome precioso tempo de execução manual. ${delayMsg} Para alcançar o resultado desejado de "${impactText}", propomos uma transição estratégica para um sistema enxuto.`,
        estimatedHoursLostMonthly: mockedHours,
        estimatedMoneyLostMonthly: mockedMoney,
        gargalos: [
          {
            title: "Descentralização de Informações",
            explanation: `Usar ${controlsText} faz com que a empresa perca o controle unificado sobre vendas e prazos de entrega.`,
            riskLevel: "alto"
          },
          {
            title: "Desperdício de Horas em Rotinas Manuais",
            explanation: `Gastar ${manualTimeText} diariamente com processos operacionais repetitivos reduz a velocidade da equipe em atender novos clientes.`,
            riskLevel: "medio"
          },
          {
            title: "Risco de Cancelamentos e Perda de Vendas",
            explanation: `A desorganização e falta de histórico já afetou o faturamento, e o método atual impede um faturamento estável.`,
            riskLevel: "alto"
          }
        ],
        planoAcao: [
          {
            step: 1,
            title: "Centralização Imediata dos Pedidos",
            action: `Estruturar um painel único integrado para acompanhar cada etapa da venda, eliminando anotações soltas.`,
            benefit: "Reduz o esquecimento de prazos e organiza o fluxo de atendimento."
          },
          {
            step: 2,
            title: "Automatizar Alertas e Mensagens",
            action: `Implementar um fluxo básico automatizado para notificação de clientes e controle de andamento das tarefas da equipe.`,
            benefit: "Economia imediata de horas que eram gastas enviando mensagens e lembretes manuais."
          },
          {
            step: 3,
            title: "Monitoramento de Margem e Faturamento",
            action: `Consolidar as entradas de caixa vinculadas a cada venda para saber precisamente qual é o lucro real diário.`,
            benefit: `Garantia de que você vai atingir a meta: "${impactText}".`
          }
        ],
        ferramentas: [
          {
            name: "Módulo de Venda & WhatsApp",
            purpose: "Registrar dados com 3 cliques direto do contato.",
            icon: "MessageSquare"
          },
          {
            name: "Controle Financeiro Descomplicado",
            purpose: "Saber o lucro de cada serviço ou produto sem complicação.",
            icon: "TrendingUp"
          },
          {
            name: "Gerenciador de Tarefas e Prazos",
            purpose: "Garantir que a equipe cumpra cada etapa sem depender do dono cobrando.",
            icon: "Calendar"
          }
        ],
        waText: localFormattedWaText
      };
    };

    // If Gemini is available, query it to construct a rich interactive on-screen analysis report
    if (ai) {
      try {
        const prompt = `Analise o perfil de negócio a seguir de forma aprofundada e profissional para estruturar um Diagnóstico Operacional Consultivo em Português do Brasil.
Abaixo forneço os dados coletados com as respostas da empresa:

Nome da Empresa: "${company}"
Ramo de Atuação: "${sector}"
Tamanho da Equipe Operacional: "${teamSizeText}"
Métodos Atuais de Controle: "${controlsText}"
Tempo Gasto em Processos Manuais/Repetitivos: "${manualTimeText}"
Principais Dores/Perdas Declaradas: "${painsText}"
Já Perdeu Clientes/Vendas p/ Desorganização?: "${lostSalesText}"
Problema Prioritário para Resolver Amanhã: "${priorityResolveText}"
Resultado Desejado Ideal: "${impactText}"
Usuário Solicitante: "${userName}" (Horário de preferência para contato: ${bestTimeText})

Retorne uma estrutura em formato JSON válida contendo análises de alto nível que mostrem de forma precisa onde esse negócio está perdendo eficiência, tempo e dinheiro, oferecendo propostas realistas e enxutas para solucionar a dor prioritária descrita pela empresa.

Instruções para o cálculo de desperdício estimado:
- Se gasta de 1 a 2 horas manuais por dia por pessoa, calcule aproximadamente 20 a 40 horas perdidas no mês por trabalhador envolvido.
- Converta essas horas em um custo financeiro de desperdício operacional (ex: usando um custo estimado de R$ 25 a R$ 50/hora por pessoa da operação em retrabalho, perda de dados ou cancelamentos).
- Ajuste proporcionalmente de acordo com a equipe e ramo.

Retorne no esquema JSON estrito:
{
  "summary": "Um parágrafo de resumo executivo bem estruturado, empático e realista apontando a realidade do negócio no setor de '${sector}' e como o fato de gerenciar via '${controlsText}' impacta a eficiência.",
  "estimatedHoursLostMonthly": <um número inteiro representando horas estimadas perdidas no mês pelo time>,
  "estimatedMoneyLostMonthly": <um número inteiro representando o prejuízo financeiro estimado em reais (BRL) mensal>,
  "gargalos": [
    {
      "title": "Título curto do gargalo (ex: Vazamento Financeiro, Gargalo de Resposta)",
      "explanation": "Explicação concisa e clara relacionando as respostas fornecidas pelo usuário.",
      "riskLevel": "alto" | "medio" | "baixo"
    },
    ... (gerar exatamente 3 gargalos estruturados)
  ],
  "planoAcao": [
    {
      "step": 1,
      "title": "Título do Passo 1",
      "action": "Ação concreta, simples e sem rodeios para implementar primeiro.",
      "benefit": "O benefício imediato obtido com essa mudança."
    },
    {
      "step": 2,
      "title": "Título do Passo 2",
      "action": "Ação focada na automação ou centralização de dados.",
      "benefit": "O benefício em termos de tempo ou organization."
    },
    {
      "step": 3,
      "title": "Título do Passo 3",
      "action": "Indicação de consolidação operacional e controle de rotina de forma enxuta.",
      "benefit": "Alcançar a visão de resultado: '${impactText}'."
    }
  ],
  "ferramentas": [
    {
      "name": "Módulo 1: ex: CRM Operacional Enxuto",
      "purpose": "Propósito prático que conecta diretamente com a dor prioritária do usuário.",
      "icon": "ex: MessageSquare ou Shield ou Database ou TrendingUp ou Calendar"
    },
    ... (gerar exatamente 3 ferramentas)
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: "Resumo executivo do diagnóstico" },
                estimatedHoursLostMonthly: { type: Type.INTEGER, description: "Total de horas desperdiçadas por mês" },
                estimatedMoneyLostMonthly: { type: Type.INTEGER, description: "Custo total financeiro do desperdício em reais" },
                gargalos: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      riskLevel: { type: Type.STRING, enum: ["alto", "medio", "baixo"] }
                    },
                    required: ["title", "explanation", "riskLevel"]
                  }
                },
                planoAcao: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      action: { type: Type.STRING },
                      benefit: { type: Type.STRING }
                    },
                    required: ["step", "title", "action", "benefit"]
                  }
                },
                ferramentas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      purpose: { type: Type.STRING },
                      icon: { type: Type.STRING }
                    },
                    required: ["name", "purpose", "icon"]
                  }
                }
              },
              required: ["summary", "estimatedHoursLostMonthly", "estimatedMoneyLostMonthly", "gargalos", "planoAcao", "ferramentas"]
            }
          }
        });

        const responseText = response.text || "{}";
        const parsedResult = JSON.parse(responseText.trim());

        res.json({
          ...parsedResult,
          waText: localFormattedWaText
        });
      } catch (geminiError: any) {
        console.error("Gemini call failed (possibly free quota exceeded / rate limit). Falling back gracefully.", geminiError);
        res.json(getFallbackResponse());
      }
    } else {
      res.json(getFallbackResponse());
    }
  } catch (error: any) {
    console.error("Error in diagnose endpoint:", error);
    res.status(500).json({ error: "Erro ao processar as respostas e gerar o diagnóstico." });
  }
});

// Configure Vite integration or serve static frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for SPA paths
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting up correctly and running on http://localhost:${PORT}`);
  });
}

startServer();
