import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Calendar, Clock, Bell, Tag, AlertCircle } from 'lucide-react';
import { Task, SubTask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void;
  selectedDate: string;
  taskToEdit?: Task;
}

const CATEGORIES = ['Trabalho', 'Estudos', 'Saúde', 'Pessoal', 'Outros'] as const;
const PRIORITIES = [
  { value: 'baixa', label: 'Baixa', color: 'bg-green-50 text-green-700 border-green-200 focus:ring-green-400' },
  { value: 'media', label: 'Média', color: 'bg-orange-50 text-orange-700 border-orange-200 focus:ring-orange-400' },
  { value: 'alta', label: 'Alta', color: 'bg-pink-50 text-pink-700 border-pink-200 focus:ring-pink-400' },
] as const;

export default function TaskModal({ isOpen, onClose, onSave, selectedDate, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [date, setDate] = useState(taskToEdit?.date || selectedDate);
  const [time, setTime] = useState(taskToEdit?.time || '');
  const [priority, setPriority] = useState<Task['priority']>(taskToEdit?.priority || 'media');
  const [category, setCategory] = useState<Task['category']>(taskToEdit?.category || 'Trabalho');
  const [reminderActive, setReminderActive] = useState(taskToEdit?.reminderActive || false);
  const [reminderTime, setReminderTime] = useState(taskToEdit?.reminderTime || '');
  const [subtasks, setSubtasks] = useState<SubTask[]>(taskToEdit?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter(sub => sub.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: taskToEdit?.id,
      title: title.trim(),
      description: description.trim(),
      date,
      time: time || undefined,
      priority,
      category,
      reminderActive,
      reminderTime: reminderActive ? (reminderTime || time || undefined) : undefined,
      subtasks,
      smartTip: taskToEdit?.smartTip
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
            id="modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100"
            id="task-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="text-xl font-bold text-neutral-800" id="modal-title">
                {taskToEdit ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                id="close-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1 space-y-4" id="modal-body">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Terminar roteiro do vídeo para o Reels"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium"
                  id="task-title-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Descrição / Notas
                </label>
                <textarea
                  placeholder="Adicione detalhes, links ou ideias para evitar travar na hora de começar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm"
                  id="task-desc-input"
                />
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-orange-500" /> Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium"
                    id="task-date-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-pink-500" /> Horário (Opcional)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium"
                    id="task-time-input"
                  />
                </div>
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-orange-500" /> Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Task['category'])}
                    className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium bg-white"
                    id="task-category-input"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5 text-pink-500" /> Prioridade
                  </label>
                  <div className="flex gap-1.5" id="priority-options">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          priority === p.value
                            ? p.value === 'alta'
                              ? 'bg-pink-500 border-pink-500 text-white shadow-xs'
                              : p.value === 'media'
                              ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                              : 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                        id={`priority-btn-${p.value}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Smart Reminder Activation */}
              <div className="rounded-2xl bg-orange-50/50 border border-orange-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="rounded-xl bg-orange-100 p-1.5 text-orange-600 mt-0.5">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-neutral-800">Lembrete Ativo</h4>
                      <p className="text-xs text-neutral-500">Notificar-me no momento em que a tarefa deve iniciar.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderActive}
                      onChange={(e) => setReminderActive(e.target.checked)}
                      className="sr-only peer"
                      id="reminder-toggle"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>

                <AnimatePresence>
                  {reminderActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="overflow-hidden"
                      id="reminder-time-container"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-neutral-600">Disparar alarme às:</span>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="rounded-xl border border-neutral-200 px-3 py-1.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 text-sm font-medium bg-white"
                          id="reminder-time-input"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtasks Checklist */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Micro-Passos / Checklists (Vencer a Inércia)
                </label>
                <form onSubmit={handleAddSubtask} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar um passo simples para facilitar o começo..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 rounded-xl border border-neutral-200 px-3.5 py-2 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 text-sm"
                    id="new-subtask-input"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-neutral-900 text-white p-2 hover:bg-neutral-800 transition-colors cursor-pointer"
                    id="add-subtask-btn"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </form>

                <div className="space-y-1.5 max-h-32 overflow-y-auto" id="subtasks-list">
                  {subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 text-xs text-neutral-700"
                    >
                      <span className="font-medium truncate">{sub.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(sub.id)}
                        className="text-neutral-400 hover:text-pink-500 rounded p-1 transition-colors"
                        id={`delete-subtask-${sub.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {subtasks.length === 0 && (
                    <p className="text-xs text-neutral-400 italic text-center py-2">
                      Nenhum micro-passo adicionado. Dividir tarefas reduz a procrastinação!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-neutral-200 px-5 py-2.5 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-semibold cursor-pointer"
                id="cancel-save-task-btn"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className={`rounded-2xl px-6 py-2.5 text-white font-bold text-sm shadow-md transition-all cursor-pointer ${
                  title.trim()
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                }`}
                id="save-task-btn"
              >
                Salvar Tarefa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
