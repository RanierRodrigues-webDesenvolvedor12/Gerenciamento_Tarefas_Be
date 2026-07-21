import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, BarChart2, Calendar, Compass } from 'lucide-react';
import { Goal } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'completed' | 'startDate'>) => void;
}

const CATEGORIES = [
  'Redes Sociais',
  'Profissional',
  'Estudos',
  'Saúde',
  'Financeiro',
  'Outros',
] as const;

export default function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Goal['type']>('semanal');
  const [category, setCategory] = useState<Goal['category']>('Redes Sociais');
  const [targetValue, setTargetValue] = useState<number>(5);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [unit, setUnit] = useState('vídeos');
  const [deadline, setDeadline] = useState('');

  const handleSave = () => {
    if (!title.trim() || targetValue <= 0) return;
    onSave({
      title: title.trim(),
      type,
      category,
      targetValue,
      currentValue: Math.min(currentValue, targetValue),
      unit: unit.trim() || 'unidades',
      deadline: deadline.trim() || undefined,
    });
    // Reset state
    setTitle('');
    setType('semanal');
    setCategory('Redes Sociais');
    setTargetValue(5);
    setCurrentValue(0);
    setUnit('vídeos');
    setDeadline('');
    onClose();
  };

  // Adjust defaults based on type selected
  const handleTypeChange = (newType: Goal['type']) => {
    setType(newType);
    if (newType === 'semanal') {
      setUnit('vídeos');
      setTargetValue(5);
      setDeadline('Esta semana');
    } else {
      setUnit('seguidores');
      setTargetValue(10000);
      setDeadline('4 meses');
    }
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
            id="goal-modal-backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100"
            id="goal-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-pink-100 p-1.5 text-pink-600">
                  <Target className="h-5 w-5 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-neutral-800" id="goal-modal-title">
                  Nova Meta de Sucesso
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                id="close-goal-modal-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="mt-4 space-y-4" id="goal-modal-body">
              {/* Type selector tab */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Tipo de Meta
                </label>
                <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-2xl" id="goal-type-tabs">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('semanal')}
                    className={`text-center py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      type === 'semanal'
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                    id="type-semanal-btn"
                  >
                    Curto Prazo (Semanal)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('longo_prazo')}
                    className={`text-center py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      type === 'longo_prazo'
                        ? 'bg-white text-pink-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                    id="type-longo-btn"
                  >
                    Longo Prazo / Visão
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Título da Meta
                </label>
                <input
                  type="text"
                  placeholder={
                    type === 'semanal'
                      ? 'Ex: Publicar 5 vídeos no Instagram'
                      : 'Ex: Alcançar 10mil seguidores'
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-semibold"
                  id="goal-title-input"
                />
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Compass className="h-3.5 w-3.5 text-orange-500" /> Categoria de Foco
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Goal['category'])}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium bg-white"
                  id="goal-category-select"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress target fields */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    Início
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm font-bold text-center"
                    id="goal-start-value"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    Meta Alvo
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm font-bold text-center"
                    id="goal-target-value"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: vídeos"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 px-3 py-2.5 text-neutral-800 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm font-medium text-center"
                    id="goal-unit-input"
                  />
                </div>
              </div>

              {/* Deadline input (text based for freedom) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-pink-500" /> Prazo / Duração
                </label>
                <input
                  type="text"
                  placeholder={type === 'semanal' ? 'Ex: Domingo' : 'Ex: 4 meses'}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-2.5 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all text-sm font-semibold"
                  id="goal-deadline-input"
                />
              </div>

              {/* Motivational Banner */}
              <div className="rounded-2xl bg-pink-50/50 border border-pink-100 p-3 text-center">
                <p className="text-[11px] font-bold text-pink-700 uppercase tracking-wider">
                  🚀 Foco na Execução
                </p>
                <p className="text-[11px] text-pink-600 font-medium mt-0.5">
                  Estipular prazos claros e acompanhar seu progresso visualmente reduz a procrastinação em 40%!
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl border border-neutral-200 px-5 py-2.5 text-neutral-600 hover:bg-neutral-50 transition-colors text-sm font-semibold cursor-pointer"
                id="cancel-goal-save"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!title.trim() || targetValue <= 0}
                className={`rounded-2xl px-6 py-2.5 text-white font-bold text-sm shadow-md transition-all cursor-pointer ${
                  title.trim() && targetValue > 0
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:scale-[1.02]'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none'
                }`}
                id="save-goal-btn"
              >
                Definir Meta
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
