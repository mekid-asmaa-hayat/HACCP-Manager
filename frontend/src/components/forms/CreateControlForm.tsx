import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { controlsApi } from '../../services/api';
import type { ControlType, Zone } from '../../types';

const schema = z.object({
  type: z.enum(['TEMPERATURE', 'HYGIENE', 'EQUIPMENT', 'DLC', 'RECEPTION']),
  zone: z.enum(['CUISINE', 'STOCKAGE_FROID', 'STOCKAGE_SEC', 'RECEPTION', 'SALLE']),
  temperature: z.number().min(-50).max(100).optional(),
  thresholdMin: z.number().optional(),
  thresholdMax: z.number().optional(),
  equipmentName: z.string().optional(),
  productName: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const CONTROL_TYPES: { value: ControlType; label: string; icon: string }[] = [
  { value: 'TEMPERATURE', label: 'Température', icon: '🌡️' },
  { value: 'HYGIENE', label: 'Hygiène', icon: '🧼' },
  { value: 'EQUIPMENT', label: 'Équipement', icon: '⚙️' },
  { value: 'DLC', label: 'DLC / Péremption', icon: '📅' },
  { value: 'RECEPTION', label: 'Réception', icon: '📦' },
];

const ZONES: { value: Zone; label: string }[] = [
  { value: 'CUISINE', label: 'Cuisine' },
  { value: 'STOCKAGE_FROID', label: 'Stockage froid' },
  { value: 'STOCKAGE_SEC', label: 'Stockage sec' },
  { value: 'RECEPTION', label: 'Réception' },
  { value: 'SALLE', label: 'Salle' },
];

interface Props {
  onSuccess?: () => void;
}

export default function CreateControlForm({ onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<ControlType | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: controlsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['controls'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onSuccess?.();
    },
  });

  const type = watch('type');

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Type de contrôle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type de contrôle *
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CONTROL_TYPES.map((ct) => (
            <button
              key={ct.value}
              type="button"
              onClick={() => { setValue('type', ct.value); setSelectedType(ct.value); }}
              className={`p-3 rounded-lg border-2 text-center transition-all text-sm
                ${type === ct.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                  : 'border-gray-200 hover:border-gray-300'}`}
            >
              <div className="text-xl mb-1">{ct.icon}</div>
              {ct.label}
            </button>
          ))}
        </div>
        {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
      </div>

      {/* Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Zone *</label>
        <select {...register('zone')} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm">
          <option value="">Sélectionner une zone</option>
          {ZONES.map((z) => (
            <option key={z.value} value={z.value}>{z.label}</option>
          ))}
        </select>
        {errors.zone && <p className="text-red-500 text-xs mt-1">{errors.zone.message}</p>}
      </div>

      {/* Champs conditionnels selon le type */}
      {type === 'TEMPERATURE' && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Température (°C) *</label>
            <input
              type="number"
              step="0.1"
              {...register('temperature', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              placeholder="Ex: 3.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil min (°C)</label>
            <input
              type="number"
              step="0.1"
              {...register('thresholdMin', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              placeholder="Ex: 0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seuil max (°C)</label>
            <input
              type="number"
              step="0.1"
              {...register('thresholdMax', { valueAsNumber: true })}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
              placeholder="Ex: 4"
            />
          </div>
        </div>
      )}

      {(type === 'EQUIPMENT' || type === 'HYGIENE') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Équipement contrôlé</label>
          <input
            type="text"
            {...register('equipmentName')}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            placeholder="Ex: Réfrigérateur n°3"
          />
        </div>
      )}

      {(type === 'DLC' || type === 'RECEPTION') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
          <input
            type="text"
            {...register('productName')}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm"
            placeholder="Ex: Filet de saumon"
          />
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Observations</label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none"
          placeholder="Observations complémentaires..."
        />
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
          Erreur lors de la sauvegarde. Veuillez réessayer.
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {mutation.isPending ? 'Enregistrement...' : '✅ Enregistrer le contrôle'}
      </button>
    </form>
  );
}
