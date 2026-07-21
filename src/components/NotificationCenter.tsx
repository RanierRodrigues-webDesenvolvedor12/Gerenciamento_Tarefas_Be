import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Clock, Volume2 } from 'lucide-react';
import { Task } from '../types';

interface NotificationCenterProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
}

interface TriggeredReminder {
  id: string;
  task: Task;
  triggeredAt: Date;
}

export default function NotificationCenter({ tasks, onCompleteTask }: NotificationCenterProps) {
  const [activeReminders, setActiveReminders] = useState<TriggeredReminder[]>([]);
  const triggeredKeysRef = useRef<Set<string>>(new Set());

  // Function to synthesize an energetic and encouraging chime sound using native browser oscillators
  const playChimeSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Uplifting sound: triangle wave is pleasant and retro-modern
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      // High-energy 3-note arpeggio (C5 -> E5 -> G5) to inspire productivity
      playTone(523.25, now, 0.3); // C5
      playTone(659.25, now + 0.12, 0.3); // E5
      playTone(783.99, now + 0.24, 0.4); // G5
    } catch (e) {
      console.warn('AudioContext not allowed or not supported in this frame until user interaction', e);
    }
  };

  useEffect(() => {
    // Run comparison checks every 5 seconds
    const interval = setInterval(() => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
      const currentDay = String(now.getDate()).padStart(2, '0');
      const todayDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      tasks.forEach((task) => {
        // Only trigger if active, incomplete, date matches today, and reminder time matches current HH:MM
        if (
          task.reminderActive &&
          !task.completed &&
          task.date === todayDateStr &&
          task.reminderTime === timeStr
        ) {
          const key = `${task.id}-${todayDateStr}-${timeStr}`;
          if (!triggeredKeysRef.current.has(key)) {
            triggeredKeysRef.current.add(key);

            // Add to active notifications
            const newReminder: TriggeredReminder = {
              id: Math.random().toString(36).substring(2, 9),
              task,
              triggeredAt: new Date(),
            };

            setActiveReminders((prev) => [...prev, newReminder]);
            playChimeSound();
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks]);

  const handleDismiss = (id: string) => {
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleComplete = (id: string, taskId: string) => {
    onCompleteTask(taskId);
    handleDismiss(id);
  };

  const handleSnooze = (id: string, reminder: TriggeredReminder) => {
    // Dismiss active notification and simulate a snooze check (will alert in 5 minutes conceptually)
    handleDismiss(id);
    alert(`Lembrete para "${reminder.task.title}" adiado por 5 minutos (Demo)!`);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm" id="notifications-overlay">
      <AnimatePresence>
        {activeReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, y: -20, scale: 0.9, rotate: -1 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            className="overflow-hidden bg-white/95 border-2 border-orange-400 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col gap-3"
            id={`reminder-banner-${reminder.id}`}
          >
            {/* Header / Icon */}
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 p-2 text-white animate-bounce">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wider">
                    Hora de Focar! ⏰
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    {reminder.task.reminderTime || reminder.task.time}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-neutral-800 truncate">
                  {reminder.task.title}
                </h4>
                {reminder.task.description && (
                  <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                    {reminder.task.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDismiss(reminder.id)}
                className="text-neutral-400 hover:text-neutral-600 p-0.5 rounded-full transition-colors"
                id={`dismiss-reminder-${reminder.id}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* AI Custom Tip if available */}
            {reminder.task.smartTip && (
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5 text-xs text-orange-700">
                <span className="font-bold">💡 Hack da IA para vencer a inércia:</span> {reminder.task.smartTip}
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 border-t border-neutral-100 pt-2.5">
              <button
                onClick={() => handleComplete(reminder.id, reminder.task.id)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-xl py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                id={`complete-reminder-btn-${reminder.id}`}
              >
                <Check className="h-3.5 w-3.5" /> Concluído
              </button>
              <button
                onClick={() => handleSnooze(reminder.id, reminder)}
                className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                id={`snooze-reminder-btn-${reminder.id}`}
              >
                <Clock className="h-3.5 w-3.5" /> Adiar
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Button to test sounds and trigger a mock alert for user onboarding */}
      {activeReminders.length === 0 && (
        <div className="self-end mr-2">
          <button
            onClick={() => {
              // Trigger a demo alarm based on an active task or creates a dynamic demo task alarm
              const testTask: Task = {
                id: 'demo-task',
                title: '⚡ Escrever posts estratégicos para o Instagram',
                description: 'Crie 3 rascunhos para stories de engajamento.',
                date: '2026-07-21',
                time: '12:00',
                priority: 'alta',
                category: 'Trabalho',
                completed: false,
                reminderActive: true,
                reminderTime: '12:00',
                smartTip: 'Não tente fazer perfeito. Faça o primeiro rascunho em 3 minutos e depois edite!',
                subtasks: [],
              };
              setActiveReminders([
                {
                  id: 'demo-alarm',
                  task: testTask,
                  triggeredAt: new Date(),
                },
              ]);
              playChimeSound();
            }}
            className="opacity-40 hover:opacity-100 flex items-center gap-1 bg-white/80 border border-neutral-200 hover:border-orange-200 text-neutral-500 hover:text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm transition-all cursor-pointer"
            id="demo-notification-test-btn"
          >
            <Volume2 className="h-3 w-3" /> Testar Som & Alarme Demo
          </button>
        </div>
      )}
    </div>
  );
}
