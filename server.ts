import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Route to optimize the user's daily tasks using local heuristics
app.post("/api/optimize-routine", async (req, res) => {
  try {
    const { tasks, goals } = req.body;

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        error: "Forneça uma lista de tarefas válida para otimização.",
      });
    }

    // Local heuristic optimization
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityWeight = { alta: 3, media: 2, baixa: 1 };
      return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    });

    const orderedTaskIds = sortedTasks.map((t) => t.id);
    const tips = tasks.map((t) => {
      let tip = "Divida esta tarefa em micro-passos de 5 minutos para começar sem resistência.";
      if (t.priority === "alta") {
        tip = `Esta é sua prioridade máxima hoje. Use a técnica Pomodoro e desligue as notificações para focar totalmente nela!`;
      } else if (t.category === "Trabalho") {
        tip = "Remova todas as distrações da mesa e defina o que é o 'sucesso' para essa entrega.";
      } else if (t.category === "Estudos") {
        tip = "Faça uma sessão ativa: resuma ou explique para si mesmo em voz alta o que aprendeu.";
      } else if (t.category === "Saúde") {
        tip = "Seu corpo é seu motor! Realize essa tarefa logo para garantir disposição o dia todo.";
      }
      return { taskId: t.id, tip };
    });

    return res.json({
      orderedTaskIds,
      tips,
      motivationQuote: "O segredo para progredir é começar. Faça o que puder, com o que tem, onde estiver!",
      procrastinationAnalysis: "Seus afazeres foram organizados com base na prioridade declarada. Comece pela tarefa mais pesada (Eat that Frog) para liberar dopamina e manter o ritmo o resto do dia.",
      offlineMode: true
    });
  } catch (error: any) {
    console.error("Erro na otimização:", error);
    return res.status(500).json({
      error: "Houve um erro ao otimizar sua rotina.",
      details: error.message || error,
    });
  }
});

// Configure Vite or Static Assets depending on Environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
