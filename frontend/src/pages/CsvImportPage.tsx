import React, { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { productsApi } from "../services/api";
import type { ImportResult } from "../types";

const EXAMPLE_CSV = `name,category,supplier,reference,storageTemperatureMax,storageTemperatureMin
Filet de saumon,POISSON,Poissonnerie Dupont,SAU-001,4,0
Entrecôte,VIANDE,Boucherie Martin,ENT-002,4,0
Lait entier,PRODUIT_LAITIER,Lactalis,LAI-003,6,0
Haricots verts surgelés,SURGELE,Bonduelle,HAR-004,-15,-25`;

export default function CsvImportPage() {
  const [csvContent, setCsvContent] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (csv: string) => productsApi.importCsv(csv),
    onSuccess: (data) => setResult(data),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvContent(ev.target?.result as string);
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    if (!csvContent.trim()) return;
    mutation.mutate(csvContent);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Import de produits</h1>
        <p className="text-gray-500 text-sm">
          Importez votre catalogue produits depuis un fichier CSV
        </p>
      </div>

      {/* Format attendu */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-2 text-sm">Format CSV attendu</h2>
        <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap bg-white border border-gray-100 rounded-lg p-3">
          {EXAMPLE_CSV}
        </pre>
        <button
          onClick={() => setCsvContent(EXAMPLE_CSV)}
          className="mt-2 text-xs text-blue-600 hover:underline"
        >
          Utiliser cet exemple
        </button>
      </div>

      {/* Upload */}
      <div className="space-y-3">
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center cursor-pointer
            hover:bg-blue-50 transition-colors"
        >
          <div className="text-3xl mb-2">📁</div>
          <p className="text-sm text-gray-600">Cliquer pour sélectionner un fichier CSV</p>
          <p className="text-xs text-gray-400 mt-1">ou déposer le fichier ici</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          rows={8}
          placeholder="Ou collez le contenu CSV directement ici..."
          className="w-full border border-gray-300 rounded-xl p-3 text-xs font-mono resize-y"
        />
      </div>

      <button
        onClick={handleImport}
        disabled={!csvContent.trim() || mutation.isPending}
        className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {mutation.isPending ? 'Importation en cours...' : '📥 Lancer l\'import'}
      </button>

      {/* Résultats */}
      {result && (
        <div className={`rounded-xl border p-4 ${
          result.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{result.errors.length === 0 ? '✅' : '⚠️'}</span>
            <h3 className="font-semibold text-gray-800">Résultat de l'import</h3>
          </div>
          <p className="text-sm text-gray-700">
            <strong>{result.imported}</strong> produit{result.imported > 1 ? 's' : ''} importé{result.imported > 1 ? 's' : ''} avec succès
          </p>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-red-700 mb-1">
                {result.errors.length} erreur{result.errors.length > 1 ? 's' : ''} :
              </p>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-xs text-red-600">
                    Ligne {err.line} : {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
