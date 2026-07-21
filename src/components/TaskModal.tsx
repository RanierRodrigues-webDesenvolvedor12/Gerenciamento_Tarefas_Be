import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Trash2, Clock, Bell, ChevronDown, ChevronUp, ListChecks, StickyNote, Zap } from 'lucide-react';
import { Task, SubTask } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'completed'> & { id?: string }) => void;
  selectedDate: string;
  taskToEdit?: Task;
}

const CATEGORIES = [
  { id: 'Trabalho', label: 'Trabalho', icon: '💼' },
  { id: 'Estudos', label: 'Estudos', icon: '📚' },
  { id: 'Saúde', label: 'Saúde', icon: '💪' },
  { id: 'Pessoal', label: 'Pessoal', icon: '✨' },
  { id: 'Outros', label: 'Outros', icon: '📌' },
] as const;

const PRIORITIES = [
  { value: 'baixa', label: 'Baixa', icon: '🟢', color: 'bg-emerald-500' },
  { value: 'media', label: 'Média', icon: '🟡', color: 'bg-orange-400' },
  { value: 'alta', label: 'Alta', icon: '🔴', color: 'bg-pink-500' },
] as const;

export default function TaskModal({ isOpen, onClose, onSave, selectedDate, taskToEdit }: TaskModalProps) {
  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [time, setTime] = useState(taskToEdit?.time || '');
  const [priority, setPriority] = useState<Task['priority']>(taskToEdit?.priority || 'media');
  const [category, setCategory] = useState<Task['category']>(taskToEdit?.category || 'Trabalho');
  const [reminderActive, setReminderActive] = useState(taskToEdit?.reminderActive || false);
  const [reminderTime, setReminderTime] = useState(taskToEdit?.reminderTime || '');
  const [subtasks, setSubtasks] = useState<SubTask[]>(taskToEdit?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(taskToEdit?.title || '');
      setDescription(taskToEdit?.description || '');
      setTime(taskToEdit?.time || '');
      setPriority(taskToEdit?.priority || 'media');
      setCategory(taskToEdit?.category || 'Trabalho');
      setReminderActive(taskToEdit?.reminderActive || false);
      setReminderTime(taskToEdit?.reminderTime || '');
      setSubtasks(taskToEdit?.subtasks || []);
      setNewSubtask('');
      setShowExtras(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, taskToEdit]);

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { id: Math.random().toString(36).substring(2, 9), title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
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
      date: selectedDate,
      time: time || undefined,
      priority,
      category,
      reminderActive,
      reminderTime: reminderActive ? (reminderTime || time || undefined) : undefined,
      subtasks,
      smartTip: taskToEdit?.smartTip,
    });
    onClose();
  };

  const hasExtras = description || subtasks.length > 0 || reminderActive;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Handle (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <h3 className="text-lg font-bold text-gray-900">
                {taskToEdit ? 'Editar tarefa' : 'Nova tarefa'}
              </h3>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {/* 1. TITULO - Campo principal e mais importante */}
              <div className="mb-5">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="O que precisa ser feito?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } }}
                  className="w-full text-lg font-semibold text-gray-900 placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:border-orange-400 focus:ring-0 outline-none pb-3 bg-transparent transition-colors"
                />
              </div>

              {/* 2. CATEGORIA - Chips com ícones */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 block">Categoria</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as Task['category'])}
                      className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${
                        category === cat.id
                          ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. PRIORIDADE - Seletor visual */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 block">Prioridade</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                        priority === p.value
                          ? p.value === 'alta'
                            ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                            : p.value === 'media'
                            ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. HORÁRIO - Opcional, discreto */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Horário (opcional)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm font-medium bg-white transition-colors"
                  />
                </div>
              </div>

              {/* 5. OPÇÕES EXTRAS - Colapsável */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExtras(!showExtras)}
                  className="flex items-center justify-between w-full group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      hasExtras ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                    }`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600">Opções extras</span>
                    {hasExtras && (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-100 px-1.5 py-0.5 rounded-full">
                        {description ? '1' : '0'}{(subtasks.length > 0 ? 1 : 0) + (reminderActive ? 1 : 0) > 0 ? ` +${(subtasks.length > 0 ? 1 : 0) + (reminderActive ? 1 : 0)}` : ''}
                      </span>
                    )}
                  </div>
                  <div className={`p-1.5 rounded-lg transition-colors ${showExtras ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                    {showExtras ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                <AnimatePresence>
                  {showExtras && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        {/* Descrição / Notas */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote className="w-4 h-4 text-gray-400" />
                            <label className="text-xs font-bold text-gray-500">Notas</label>
                          </div>
                          <textarea
                            placeholder="Adicione detalhes, links ou lembretes..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm resize-none transition-colors"
                          />
                        </div>

                        {/* Checklist */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ListChecks className="w-4 h-4 text-gray-400" />
                            <label className="text-xs font-bold text-gray-500">Checklist</label>
                          </div>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Adicionar item..."
                              value={newSubtask}
                              onChange={(e) => setNewSubtask(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                              className="flex-1 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={handleAddSubtask}
                              className="rounded-xl bg-gray-900 text-white px-3 py-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {subtasks.length > 0 && (
                            <div className="space-y-1.5 max-h-24 overflow-y-auto">
                              {subtasks.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-4 h-4 rounded border-2 border-gray-300 shrink-0" />
                                    <span className="truncate">{sub.title}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSubtask(sub.id)}
                                    className="text-gray-400 hover:text-pink-500 p-1 shrink-0 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Lembrete */}
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bell className={`w-4 h-4 ${reminderActive ? 'text-orange-500' : 'text-gray-400'}`} />
                              <span className="text-xs font-bold text-gray-500">Lembrete</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setReminderActive(!reminderActive)}
                              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                                reminderActive ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-200'
                              }`}
                            >
                              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                reminderActive ? 'translate-x-5' : ''
                              }`} />
                            </button>
                          </div>
                          <AnimatePresence>
                            {reminderActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2.5">
                                  <input
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-gray-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm font-medium bg-white transition-colors"
                                  />
                                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                                    {!reminderTime && time ? `Usará o horário da tarefa (${time})` : 'Será notificado neste horário'}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer - Botão salvar */}
            <div className="px-5 pb-5 pt-2 shrink-0 border-t border-gray-50">
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim()}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  title.trim()
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {taskToEdit ? 'Salvar alterações' : 'Criar tarefa'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
