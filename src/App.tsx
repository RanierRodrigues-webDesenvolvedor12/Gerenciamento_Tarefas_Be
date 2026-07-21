import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  Target,
  Flame,
  Trophy,
  Zap,
  Brain,
  Trash2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  Bell,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { Task, Goal, SubTask } from './types';
import TaskModal from './components/TaskModal';
import GoalModal from './components/GoalModal';
import NotificationCenter from './components/NotificationCenter';

// Default tasks for Monday July 20 to Sunday July 26, 2026
const DEFAULT_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Gravar e publicar reels sobre dicas de gestão de tempo',
    description: 'Fazer vídeo dinâmico mostrando meu planner e como divido o dia em blocos de foco.',
    date: '2026-07-21',
    time: '10:00',
    priority: 'alta',
    category: 'Trabalho',
    completed: false,
    reminderActive: true,
    reminderTime: '10:00',
    subtasks: [
      { id: 's1', title: 'Escrever roteiro em tópicos de 3 pontos', completed: false },
      { id: 's2', title: 'Gravar 3 tomadas de vídeo simples no celular', completed: false },
      { id: 's3', title: 'Legendar rápido e postar no Instagram', completed: false }
    ],
    smartTip: 'Comece pelo roteiro agora mesmo! Escrever a primeira frase leva apenas 30 segundos.'
  },
  {
    id: 't2',
    title: 'Estudo ativo de algoritmos e estruturas de dados',
    description: 'Estudar os conceitos de filas de prioridade e implementar 1 exemplo prático.',
    date: '2026-07-21',
    time: '14:30',
    priority: 'media',
    category: 'Estudos',
    completed: false,
    reminderActive: false,
    subtasks: [
      { id: 's4', title: 'Ler resumo teórico de 15 minutos', completed: false },
      { id: 's5', title: 'Escrever código de teste em TypeScript', completed: false }
    ]
  },
  {
    id: 't3',
    title: 'Preparar marmitas saudáveis para os próximos dias',
    description: 'Grelhar frango, cozinhar legumes e porcionar em potes para facilitar o foco semanal.',
    date: '2026-07-21',
    time: '19:00',
    priority: 'baixa',
    category: 'Saúde',
    completed: true,
    reminderActive: false,
    subtasks: []
  },
  {
    id: 't4',
    title: 'Reunião de alinhamento com equipe de marketing',
    description: 'Apresentar planejamento de métricas das redes sociais.',
    date: '2026-07-22',
    time: '11:00',
    priority: 'alta',
    category: 'Trabalho',
    completed: false,
    reminderActive: true,
    reminderTime: '11:00',
    subtasks: []
  }
];

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'g1',
    title: 'Publicar 5 vídeos essa semana no Instagram',
    type: 'semanal',
    category: 'Redes Sociais',
    targetValue: 5,
    currentValue: 3,
    unit: 'vídeos',
    deadline: 'Até Domingo',
    completed: false,
    startDate: '2026-07-20'
  },
  {
    id: 'g2',
    title: 'Alcançar 10mil seguidores em 4 meses',
    type: 'longo_prazo',
    category: 'Redes Sociais',
    targetValue: 10000,
    currentValue: 4500,
    unit: 'seguidores',
    deadline: 'Novembro de 2026',
    completed: false,
    startDate: '2026-07-20'
  },
  {
    id: 'g3',
    title: 'Completar 10 sessões de treino físico',
    type: 'semanal',
    category: 'Saúde',
    targetValue: 4,
    currentValue: 2,
    unit: 'treinos',
    deadline: 'Até Domingo',
    completed: false,
    startDate: '2026-07-20'
  },
  {
    id: 'g4',
    title: 'Estudar 20 horas de programação',
    type: 'longo_prazo',
    category: 'Estudos',
    targetValue: 20,
    currentValue: 8,
    unit: 'horas',
    deadline: 'Próximos 30 dias',
    completed: false,
    startDate: '2026-07-20'
  }
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('planner_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('planner_goals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });

  // Current selected day. Default is '2026-07-21' (Tuesday of our current week)
  const [selectedDate, setSelectedDate] = useState('2026-07-21');

  // Modal control
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

  // IA State
  const [aiQuote, setAiQuote] = useState(() => {
    return localStorage.getItem('planner_ai_quote') ||
      'Seu cérebro foi feito para pensar, não para guardar tarefas. Clique em "Otimizar com IA" para organizar seu dia com inteligência cognitiva! 🧠🔥';
  });
  const [aiAnalysis, setAiAnalysis] = useState(() => {
    return localStorage.getItem('planner_ai_analysis') ||
      'A inteligência do Gemini pode analisar a carga do seu dia, ordenar suas tarefas da forma ideal para gastar menos energia mental e fornecer hacks rápidos contra a procrastinação.';
  });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimizedDate, setLastOptimizedDate] = useState<string | null>(() => {
    return localStorage.getItem('planner_last_optimized_date');
  });

  // Daily mini-habits interactive state
  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const saved = localStorage.getItem('habit_water_intake');
    return saved ? parseFloat(saved) : 1.5;
  });

  const [focusMinutes, setFocusMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('habit_focus_minutes');
    return saved ? parseInt(saved) : 15;
  });

  // Saving state to localStorage
  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planner_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('planner_ai_quote', aiQuote);
  }, [aiQuote]);

  useEffect(() => {
    localStorage.setItem('planner_ai_analysis', aiAnalysis);
  }, [aiAnalysis]);

  useEffect(() => {
    localStorage.setItem('habit_water_intake', waterIntake.toString());
  }, [waterIntake]);

  useEffect(() => {
    localStorage.setItem('habit_focus_minutes', focusMinutes.toString());
  }, [focusMinutes]);

  useEffect(() => {
    if (lastOptimizedDate) {
      localStorage.setItem('planner_last_optimized_date', lastOptimizedDate);
    }
  }, [lastOptimizedDate]);

  // Generate 7 days of the current week (July 20 to July 26, 2026)
  const weekDays = [
    { date: '2026-07-20', label: 'Seg', name: 'Segunda-feira' },
    { date: '2026-07-21', label: 'Ter', name: 'Terça-feira' },
    { date: '2026-07-22', label: 'Qua', name: 'Quarta-feira' },
    { date: '2026-07-23', label: 'Qui', name: 'Quinta-feira' },
    { date: '2026-07-24', label: 'Sex', name: 'Sexta-feira' },
    { date: '2026-07-25', label: 'Sáb', name: 'Sábado' },
    { date: '2026-07-26', label: 'Dom', name: 'Domingo' }
  ];

  // Filters tasks for selected date
  const dailyTasks = tasks.filter((t) => t.date === selectedDate);

  // Calculate task completions for calendar header badges
  const getTasksStatsForDate = (dateStr: string) => {
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.completed).length;
    return { total, completed };
  };

  // Weekly progress metrics (completions overall)
  const weekTasks = tasks.filter((t) => {
    return t.date >= '2026-07-20' && t.date <= '2026-07-26';
  });
  const totalWeekTasks = weekTasks.length;
  const completedWeekTasks = weekTasks.filter((t) => t.completed).length;
  const weeklySuccessPercentage = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  // Add or Edit a Task
  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      // Edit mode
      setTasks(
        tasks.map((t) =>
          t.id === taskData.id
            ? { ...t, ...taskData } as Task
            : t
        )
      );
    } else {
      // Create mode
      const newTask: Task = {
        ...taskData,
        id: Math.random().toString(36).substring(2, 9),
        completed: false
      } as Task;
      setTasks([...tasks, newTask]);
    }
    setTaskToEdit(undefined);
  };

  // Toggle complete task
  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const newCompleted = !t.completed;
          // Clean triggers on completed tasks
          return { ...t, completed: newCompleted };
        }
        return t;
      })
    );
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  // Toggle checklist subtasks
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          // Auto-mark parent task completed if all subtasks are completed,
          // or just update subtasks (we let the user decide parent completion manually, which is safer)
          return { ...t, subtasks: updatedSubs };
        }
        return t;
      })
    );
  };

  // Add new goal
  const handleSaveGoal = (goalData: Omit<Goal, 'id' | 'completed' | 'startDate'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.random().toString(36).substring(2, 9),
      completed: false,
      startDate: new Date().toISOString().split('T')[0]
    };
    setGoals([...goals, newGoal]);
  };

  // Delete Goal
  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  // Increment or Decrement Goal Progress (Vibrant Tactile interaction)
  const handleAdjustGoal = (id: string, amount: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === id) {
          const newVal = Math.max(0, Math.min(g.targetValue, g.currentValue + amount));
          return {
            ...g,
            currentValue: newVal,
            completed: newVal === g.targetValue
          };
        }
        return g;
      })
    );
  };

  // Optimize routine locally (client-side only)
  const handleOptimizeRoutine = () => {
    if (dailyTasks.length === 0) {
      alert('Adicione pelo menos uma tarefa para este dia antes de solicitar a otimização!');
      return;
    }

    setIsOptimizing(true);

    setTimeout(() => {
      const sortedTasks = [...dailyTasks].sort((a, b) => {
        const priorityWeight = { alta: 3, media: 2, baixa: 1 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      });

      const orderedIds = sortedTasks.map((t) => t.id);
      const tipsArray = dailyTasks.map((t) => {
        let tip = 'Divida esta tarefa em micro-passos de 5 minutos para começar sem resistência.';
        if (t.priority === 'alta') {
          tip = 'Esta é sua prioridade máxima hoje. Use a técnica Pomodoro e desligue as notificações para focar totalmente nela!';
        } else if (t.category === 'Trabalho') {
          tip = 'Remova todas as distrações da mesa e defina o que é o "sucesso" para essa entrega.';
        } else if (t.category === 'Estudos') {
          tip = 'Faça uma sessão ativa: resuma ou explique para si mesmo em voz alta o que aprendeu.';
        } else if (t.category === 'Saúde') {
          tip = 'Seu corpo é seu motor! Realize essa tarefa logo para garantir disposição o dia todo.';
        }
        return { taskId: t.id, tip };
      });

      setTasks((prevTasks) => {
        return prevTasks.map((t) => {
          const matchingTip = tipsArray.find((tip) => tip.taskId === t.id);
          if (matchingTip) {
            return { ...t, smartTip: matchingTip.tip };
          }
          return t;
        });
      });

      setTasks((prevTasks) => {
        const otherDaysTasks = prevTasks.filter((t) => t.date !== selectedDate);
        const thisDayTasks = prevTasks.filter((t) => t.date === selectedDate);

        const sortedThisDay = [...thisDayTasks].sort((a, b) => {
          const indexA = orderedIds.indexOf(a.id);
          const indexB = orderedIds.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        return [...otherDaysTasks, ...sortedThisDay];
      });

      setAiQuote('O segredo para progredir é começar. Faça o que puder, com o que tem, onde estiver!');
      setAiAnalysis('Seus afazeres foram organizados com base na prioridade declarada. Comece pela tarefa mais pesada (Eat that Frog) para liberar dopamina e manter o ritmo o resto do dia.');
      setLastOptimizedDate(selectedDate);

      alert('Otimização local ativada com sucesso!');
      setIsOptimizing(false);
    }, 500);
  };

  // Helper for Category badge colors
  const getCategoryStyles = (cat: Task['category']) => {
    switch (cat) {
      case 'Trabalho':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Estudos':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Saúde':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pessoal':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getPriorityBorder = (priority: Task['priority']) => {
    switch (priority) {
      case 'alta':
        return 'border-l-4 border-l-pink-500';
      case 'media':
        return 'border-l-4 border-l-orange-500';
      case 'baixa':
        return 'border-l-4 border-l-emerald-500';
    }
  };

  const handleAddWater = () => {
    setWaterIntake((prev) => {
      const next = prev + 0.25;
      return next > 3.0 ? 0 : parseFloat(next.toFixed(2));
    });
  };

  const handleAddFocus = () => {
    setFocusMinutes((prev) => {
      const next = prev + 15;
      return next > 120 ? 0 : next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-800 font-sans antialiased selection:bg-orange-100 flex flex-col">
      {/* Dynamic Native Notifications integration */}
      <NotificationCenter
        tasks={tasks}
        onCompleteTask={(taskId) => handleToggleComplete(taskId)}
      />

      {/* Header Navigation matching Vibrant Palette style */}
      <header className="h-20 px-4 sm:px-8 flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-50/45 to-pink-50/45 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Calendar className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-pink-600 font-display tracking-tight">
              FlowAgenda
            </h1>
            <p className="hidden sm:block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              Foco & Rotina Vibrante
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Quick Date Display pill */}
          <div className="flex bg-orange-100/50 p-1 rounded-full text-xs font-bold">
            <button
              onClick={() => setSelectedDate('2026-07-21')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedDate === '2026-07-21'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => {
                // Select first day of this week
                setSelectedDate('2026-07-20');
              }}
              className={`hidden md:block px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                selectedDate === '2026-07-20'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-orange-600'
              }`}
            >
              Início da Semana
            </button>
          </div>

          <div className="flex items-center gap-4 border-l border-orange-100 pl-4 sm:pl-6">
            <div className="relative">
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse" />
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-100 to-pink-100 border-2 border-white shadow-sm flex items-center justify-center font-black text-orange-600 text-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Main 12-Column Grid Area */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl w-full mx-auto">
        
        {/* SIDEBAR: Weekly Progress & Long-Term Goals (Column 1 - cols 3) */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Weekly Progress bar chart */}
          <section className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-orange-700 uppercase tracking-wider">
                Progresso Semanal
              </h2>
              <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                {weeklySuccessPercentage}%
              </span>
            </div>

            {/* Micro bar charts for each of the 7 week days */}
            <div className="flex items-end justify-between h-32 px-1">
              {weekDays.map((day) => {
                const stats = getTasksStatsForDate(day.date);
                const rate = stats.total > 0 ? stats.completed / stats.total : 0;
                const barHeight = stats.total > 0 ? `${Math.max(10, rate * 100)}%` : '8%';
                const isSelected = selectedDate === day.date;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className="flex flex-col items-center gap-2 group cursor-pointer focus:outline-none flex-1"
                    title={`${day.name}: ${stats.completed}/${stats.total} concluídos`}
                  >
                    <div className="w-2.5 sm:w-3 bg-gray-100/80 rounded-full h-24 flex items-end overflow-hidden border border-gray-200/20">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        className={`w-full rounded-full transition-all ${
                          isSelected
                            ? 'bg-gradient-to-t from-pink-500 to-orange-400'
                            : rate === 1
                            ? 'bg-emerald-400'
                            : stats.total > 0
                            ? 'bg-orange-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase transition-colors ${
                        isSelected ? 'text-pink-600 font-extrabold' : 'text-gray-400 group-hover:text-orange-600'
                      }`}
                    >
                      {day.label[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Overall weekly success bar */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-orange-100/30">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-gray-600">Foco Semanal</span>
                <span className="text-xs font-extrabold text-pink-600">{weeklySuccessPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklySuccessPercentage}%` }}
                  className="bg-gradient-to-r from-orange-400 to-pink-500 h-1.5 rounded-full"
                />
              </div>
            </div>
          </section>

          {/* Goals section */}
          <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-pink-500 animate-pulse" /> Metas Ativas
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(true)}
                className="text-[10px] font-extrabold text-orange-600 hover:text-pink-600 transition-colors cursor-pointer"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[360px] pr-1">
              
              {/* Weekly Goals subset */}
              {goals.filter(g => g.type === 'semanal').length > 0 && (
                <div className="space-y-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Semanais</span>
                  {goals.filter(g => g.type === 'semanal').map((goal) => {
                    const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                    return (
                      <div key={goal.id} className="p-3 bg-orange-50/40 rounded-2xl border border-orange-100/20 group">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-gray-800 leading-snug">{goal.title}</h4>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-500 transition-all cursor-pointer p-0.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Interactive adjustments */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-white border border-gray-200/40 rounded-xl p-0.5 shadow-xs">
                            <button
                              onClick={() => handleAdjustGoal(goal.id, -1)}
                              className="text-gray-400 hover:text-pink-600 p-0.5 transition-colors cursor-pointer"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                            <span className="text-[11px] font-black text-gray-700 min-w-[28px] text-center">
                              {goal.currentValue}/{goal.targetValue}
                            </span>
                            <button
                              onClick={() => handleAdjustGoal(goal.id, 1)}
                              className="text-gray-400 hover:text-orange-600 p-0.5 transition-colors cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="text-[10px] font-black text-orange-600">{pct}%</span>
                        </div>

                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-orange-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Long Term Vision subset */}
              {goals.filter(g => g.type === 'longo_prazo').length > 0 && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Longo Prazo / Visão</span>
                  {goals.filter(g => g.type === 'longo_prazo').map((goal) => {
                    const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                    return (
                      <div key={goal.id} className="p-3 bg-pink-50/40 rounded-2xl border border-pink-100/20 group">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-gray-800 leading-snug">{goal.title}</h4>
                            <p className="text-[9px] text-pink-500 font-bold mt-0.5 uppercase">{goal.category}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-pink-500 transition-all cursor-pointer p-0.5 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Interactive adjustments for larger targets */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-1.5 bg-white border border-gray-200/40 rounded-xl px-1.5 py-0.5 shadow-xs">
                            <button
                              onClick={() => handleAdjustGoal(goal.id, -100)}
                              className="text-[9px] font-extrabold text-pink-600 hover:bg-pink-50 px-1 rounded transition-colors cursor-pointer"
                            >
                              -100
                            </button>
                            <span className="text-[11px] font-black text-gray-700">
                              {goal.currentValue}
                            </span>
                            <button
                              onClick={() => handleAdjustGoal(goal.id, 100)}
                              className="text-[9px] font-extrabold text-orange-600 hover:bg-orange-50 px-1 rounded transition-colors cursor-pointer"
                            >
                              +100
                            </button>
                          </div>
                          <span className="text-[9px] text-gray-400 font-bold">Alvo: {goal.targetValue}</span>
                        </div>

                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-pink-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {goals.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-400 italic">Defina metas para orientar seu progresso semanal e de longo prazo!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="mt-auto w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-xs font-bold hover:border-orange-300 hover:text-orange-400 transition-all cursor-pointer"
            >
              + Nova Meta
            </button>
          </section>
        </aside>

        {/* MAIN CONTENT: Daily Agenda (Column 2 - cols 6) */}
        <section className="col-span-12 lg:col-span-6 bg-white rounded-[32px] border-2 border-orange-100/50 shadow-xl shadow-orange-100/10 p-4 sm:p-8 flex flex-col min-w-0">
          
          {/* Header of Daily Planner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {selectedDate === '2026-07-21' ? 'Hoje' : 'Agenda'}
              </h2>
              <p className="text-gray-500 font-semibold text-sm">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start sm:self-auto"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Nova Tarefa
            </button>
          </div>

          {/* Interactive Days Navigator styled exactly like tabs / week days selector in design */}
          <div className="flex bg-orange-100/35 p-1 rounded-2xl mb-6 overflow-x-auto gap-1">
            {weekDays.map((day) => {
              const isSelected = selectedDate === day.date;
              const stats = getTasksStatsForDate(day.date);
              const isCompleted = stats.total > 0 && stats.completed === stats.total;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex-1 min-w-[42px] py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-gray-500 hover:text-orange-600 hover:bg-white/40'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider opacity-70">{day.label}</span>
                  <span className="text-sm font-black mt-0.5">{day.date.split('-')[2]}</span>
                  {stats.total > 0 && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-orange-400 animate-pulse'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Task lists container */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-1">
            <AnimatePresence mode="popLayout">
              {dailyTasks.map((task) => {
                const totalSubs = task.subtasks.length;
                const completedSubs = task.subtasks.filter((s) => s.completed).length;

                if (task.completed) {
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100/80 opacity-65 hover:opacity-90 transition-all"
                    >
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white cursor-pointer hover:bg-orange-600"
                        title="Reativar Tarefa"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-500 line-through truncate">
                          {task.title}
                        </h3>
                        <p className="text-[9px] font-extrabold text-gray-400 tracking-wider uppercase mt-0.5">
                          FINALIZADO
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50/50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`group flex flex-col gap-3 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/20 transition-all ${getPriorityBorder(
                      task.priority
                    )}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox triggers completion */}
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="w-6 h-6 rounded-lg border-2 border-orange-400 flex items-center justify-center bg-white group-hover:bg-orange-50 shrink-0 mt-0.5 cursor-pointer"
                        title="Concluir Tarefa"
                      >
                        <div className="w-2.5 h-2.5 bg-orange-400 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-800 leading-snug break-words">
                            {task.title}
                          </h3>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${getCategoryStyles(
                              task.category
                            )}`}
                          >
                            {task.category}
                          </span>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Badges footer for tasks */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap text-[10px] font-black text-gray-400">
                          <span
                            className={`px-2 py-0.5 rounded-full font-extrabold tracking-wide ${
                              task.priority === 'alta'
                                ? 'bg-pink-100 text-pink-600 border border-pink-200/30'
                                : task.priority === 'media'
                                ? 'bg-orange-100 text-orange-600 border border-orange-200/30'
                                : 'bg-emerald-100 text-emerald-600 border border-emerald-200/30'
                            }`}
                          >
                            {task.priority.toUpperCase()}
                          </span>

                          {task.time && (
                            <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              {task.time}
                            </span>
                          )}

                          {task.reminderActive && (
                            <span className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                              <Bell className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                              Alarme: {task.reminderTime || task.time}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rightmost controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => {
                            setTaskToEdit(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Checklists subtasks subset */}
                    {totalSubs > 0 && (
                      <div className="mt-2 pl-10 border-t border-dashed border-gray-100 pt-2.5 space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black tracking-wider text-gray-400">
                          <span>MICRO-PASSOS DE FOCO</span>
                          <span className="text-orange-600">
                            {completedSubs}/{totalSubs} CONCLUÍDOS
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {task.subtasks.map((sub) => (
                            <label
                              key={sub.id}
                              className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer hover:text-gray-900 select-none"
                            >
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(task.id, sub.id)}
                                className="rounded border-gray-300 text-orange-500 focus:ring-orange-200 h-3.5 w-3.5 cursor-pointer"
                              />
                              <span className={sub.completed ? 'line-through text-gray-400 font-medium' : 'font-medium'}>
                                {sub.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Smart tip if available */}
                    {task.smartTip && (
                      <div className="mt-1.5 ml-10 p-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-100/50 rounded-2xl flex gap-2.5 items-start">
                        <Brain className="h-4.5 w-4.5 text-orange-500 shrink-0 mt-0.5 animate-pulse" />
                        <p className="text-[11px] text-gray-700 leading-relaxed font-semibold">
                          <span className="font-extrabold text-orange-600">Dica da IA para agir:</span>{' '}
                          {task.smartTip}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {dailyTasks.length === 0 && (
              <div className="py-12 px-6 text-center border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">Tudo calmo hoje!</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Aproveite este espaço limpo para planejar suas próximas atividades e manter-se focado!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT SIDEBAR: Smart Reminders & Habits & Quick Insights (Column 3 - cols 3) */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Smart Reminders / AI Optimization coach */}
          <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-bold text-pink-600 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
              Lembretes Inteligentes
            </h2>

            <div className="space-y-3">
              {/* Dynamic Quote Box */}
              <div className="p-3 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl text-white shadow-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-1.5">
                  <p className="text-[10px] font-black uppercase opacity-90 tracking-wide">Conselho da IA</p>
                  <span className="text-[9px] font-black bg-white/20 px-1.5 py-0.5 rounded uppercase">Agora</span>
                </div>
                <p className="text-[11px] leading-relaxed font-semibold italic">
                  "{aiQuote}"
                </p>
              </div>

              {/* Day Analysis Explanation */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight mb-1">
                  Diagnóstico de Resistência
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                  {aiAnalysis}
                </p>
              </div>
            </div>

            {/* AI Action trigger */}
            <button
              onClick={handleOptimizeRoutine}
              disabled={isOptimizing || dailyTasks.length === 0}
              className={`w-full rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                dailyTasks.length === 0
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                  : isOptimizing
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 opacity-80 cursor-wait'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:shadow-xl hover:brightness-110 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isOptimizing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Otimizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  Otimizar Rotina com IA
                </>
              )}
            </button>
          </section>

          {/* Daily Habits tracker */}
          <section className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Hábitos Diários
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAddWater}
                className="aspect-square bg-orange-50/50 hover:bg-orange-50 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all border border-transparent hover:border-orange-100/50 focus:outline-none focus:ring-2 focus:ring-orange-100 group"
                title="Clique para adicionar 250ml"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">💧</span>
                <span className="text-[10px] font-black text-orange-700 mt-1 uppercase tracking-wide">Água</span>
                <span className="text-xs font-bold text-orange-500 mt-0.5">{waterIntake}/3L</span>
                <span className="text-[8px] text-orange-400/80 font-black mt-1 uppercase">+250ml</span>
              </button>

              <button
                onClick={handleAddFocus}
                className="aspect-square bg-pink-50/50 hover:bg-pink-50 rounded-2xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all border border-transparent hover:border-pink-100/50 focus:outline-none focus:ring-2 focus:ring-pink-100 group"
                title="Clique para adicionar 15 min de foco"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🧘</span>
                <span className="text-[10px] font-black text-pink-700 mt-1 uppercase tracking-wide">Foco</span>
                <span className="text-xs font-bold text-pink-500 mt-0.5 font-mono">{focusMinutes} min</span>
                <span className="text-[8px] text-pink-400/80 font-black mt-1 uppercase">+15 min</span>
              </button>
            </div>
          </section>

          {/* Productivity coach micro tips */}
          <section className="mt-auto">
            <div className="bg-orange-100/30 rounded-3xl p-4 border border-orange-100/20 shadow-xs">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                Dica de Produtividade
              </p>
              <p className="text-xs text-orange-800 mt-1 leading-relaxed font-semibold">
                "Use a técnica Pomodoro na sua próxima tarefa de foco para reduzir a procrastinação e gastar até 30% menos energia cerebral."
              </p>
            </div>
          </section>
        </aside>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 px-4 sm:px-8 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-gray-400 shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> 
            Sistema Sincronizado
          </span>
          <span className="hidden sm:inline">Última atualização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 sm:w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 w-[70%]" />
          </div>
          <span className="text-gray-500 uppercase tracking-tight">70% de energia focada</span>
        </div>
      </footer>

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(undefined);
        }}
        onSave={handleSaveTask}
        selectedDate={selectedDate}
        taskToEdit={taskToEdit}
      />

      {/* Goal Creation Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
}
