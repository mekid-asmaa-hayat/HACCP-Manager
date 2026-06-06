import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const STEPS = [
  {
    title: 'Bienvenue dans HACCPManager 👋',
    description:
      'Ce progiciel vous permet de gérer l\'ensemble de vos contrôles HACCP, ' +
      'de tracer vos produits et de générer vos rapports de conformité automatiquement.',
    icon: '🛡️',
    tip: null,
  },
  {
    title: 'Saisir un contrôle HACCP 🌡️',
    description:
      'Depuis le menu "Contrôles", créez un nouveau contrôle en sélectionnant le type ' +
      '(température, hygiène, équipement…), la zone concernée et les valeurs mesurées.',
    icon: '📋',
    tip: 'Astuce : Le statut de conformité est calculé automatiquement selon les seuils configurés.',
  },
  {
    title: 'Gérer vos produits & lots 📦',
    description:
      'Le module Produits vous permet de référencer vos articles, gérer les numéros de lot ' +
      'et suivre les DLC. Importez vos données depuis un fichier CSV en un seul clic.',
    icon: '📦',
    tip: 'Vous recevrez une alerte automatique pour les lots expirant dans les 3 prochains jours.',
  },
  {
    title: 'Générer vos rapports PDF 📄',
    description:
      'Depuis le menu "Rapports", générez vos rapports de conformité journaliers, ' +
      'hebdomadaires ou mensuels. Chaque rapport est horodaté et prêt pour les inspections.',
    icon: '📊',
    tip: 'Les rapports sont archivés et consultables à tout moment.',
  },
  {
    title: 'Vous êtes prêt(e) ! 🎉',
    description:
      'Votre espace HACCPManager est configuré. Si vous avez besoin d\'aide, ' +
      'consultez le guide utilisateur accessible depuis le menu "?" en haut à droite.',
    icon: '✅',
    tip: null,
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const { user } = useAuth();
  const current = STEPS[step];

  const completeMutation = useMutation({
    mutationFn: () => api.patch(`/users/${user?.id}/onboarding`),
    onSuccess: onComplete,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{current.icon}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-3">{current.title}</h2>
          <p className="text-gray-600 leading-relaxed">{current.description}</p>
          {current.tip && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
              💡 {current.tip}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-0 transition-colors"
          >
            ← Précédent
          </button>

          <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg
                hover:bg-blue-700 transition-colors"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
              className="bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-lg
                hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {completeMutation.isPending ? 'Chargement...' : 'Commencer 🚀'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
