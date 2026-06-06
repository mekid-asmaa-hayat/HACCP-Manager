import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { controlsApi } from '../services/api'
import CreateControlForm from '../components/forms/CreateControlForm'
import type { Control } from '../types'

const STATUS_STYLE: Record<string, string> = {
  CONFORME: 'bg-green-100 text-green-700',
  NON_CONFORME: 'bg-red-100 text-red-700',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
  CORRIGE: 'bg-blue-100 text-blue-700',
}

export default function ControlsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['controls'],
    queryFn: () => controlsApi.getAll({ limit: 50 }),
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contrôles HACCP</h1>
          <p className="text-gray-500 text-sm">Historique et saisie des points de contrôle</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {showForm ? '✕ Annuler' : '+ Nouveau contrôle'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Saisir un contrôle</h2>
          <CreateControlForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">📋</div>
            <p>Aucun contrôle enregistré</p>
            <p className="text-sm">Cliquez sur "Nouveau contrôle" pour commencer</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Zone</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Valeur</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.data.map((c: Control) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-700">{c.type}</td>
                  <td className="px-4 py-3 text-gray-600">{c.zone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {c.temperature != null ? `${c.temperature}°C` : c.productName || c.equipmentName || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(c.controlledAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {c.createdBy?.firstName} {c.createdBy?.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
