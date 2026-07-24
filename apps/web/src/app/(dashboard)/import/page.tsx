'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Download, CheckCircle, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import { api } from '@/lib/api';

type ImportType = 'membres' | 'donateurs' | 'employes' | 'beneficiaires';

interface ValidationResult {
  valide: boolean;
  lignes: number;
  erreurs: { ligne: number; champ: string; message: string }[];
  apercu: any[];
}

interface ImportResult {
  total: number;
  succes: number;
  erreurs: { ligne: number; message: string }[];
}

const TYPES: ImportType[] = ['membres', 'donateurs', 'employes', 'beneficiaires'];

export default function ImportPage() {
  const t = useTranslations('outils.import');
  const [type, setType] = useState<ImportType>('membres');
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'validate' | 'result'>('select');
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    try {
      const res = await api.get(`/import/template/${type}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `template-${type}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(t('erreurTemplate'));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setValidation(null);
      setResult(null);
      setStep('select');
    }
  };

  const valider = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      const res = await api.post(`/import/valider/${type}`, fd);
      setValidation(res.data);
      setStep('validate');
    } catch (e: any) {
      alert(t('erreurValidation', { message: e.response?.data?.message ?? e.message }));
    } finally {
      setLoading(false);
    }
  };

  const importer = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      const res = await api.post(`/import/${type}`, fd);
      setResult(res.data);
      setStep('result');
    } catch (e: any) {
      alert(t('erreurImport', { message: e.response?.data?.message ?? e.message }));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setValidation(null);
    setResult(null);
    setStep('select');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('titre')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('sousTitre')}</p>
      </div>

      {/* Sélection du type */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">{t('typeDonnees')}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TYPES.map((v) => (
            <button key={v} onClick={() => { setType(v); reset(); }} className={`py-2 px-3 rounded-lg text-sm border transition-colors ${type === v ? 'bg-primary/10 border-primary text-primary font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {t(`types.${v}` as never)}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{t('modeleAide')}</p>
          <button onClick={downloadTemplate} className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Download className="w-4 h-4" /> {t('telechargerModele')}
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">{t('fichier')}</p>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${file ? 'border-primary/40 bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
          onClick={() => fileRef.current?.click()}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
              </div>
              <button onClick={e => { e.stopPropagation(); reset(); }} className="ml-4 text-gray-400 hover:text-red-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">{t('choisirFichier')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('tailleMax')}</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />

        {file && step === 'select' && (
          <button onClick={valider} disabled={loading} className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-60 hover:bg-primary/90">
            {loading ? t('validationEnCours') : t('valider')}
          </button>
        )}
      </div>

      {/* Résultat validation */}
      {step === 'validate' && validation && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            {validation.valide ? (
              <><CheckCircle className="w-5 h-5 text-green-500" /><p className="font-medium text-green-700">{t('fichierValide', { count: validation.lignes })}</p></>
            ) : (
              <><AlertCircle className="w-5 h-5 text-red-500" /><p className="font-medium text-red-700">{t('erreursDetectees', { count: validation.erreurs.length })}</p></>
            )}
          </div>

          {validation.erreurs.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
              {validation.erreurs.map((e, i) => (
                <p key={i} className="text-sm text-red-700">{t('erreurLigneChamp', { ligne: String(e.ligne), champ: e.champ, message: e.message })}</p>
              ))}
            </div>
          )}

          {validation.apercu.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">{t('apercu')}</p>
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-2 py-1 text-left">{t('colLigne')}</th>
                      <th className="border border-gray-200 px-2 py-1 text-left">{t('colNom')}</th>
                      <th className="border border-gray-200 px-2 py-1 text-left">{t('colPrenom')}</th>
                      <th className="border border-gray-200 px-2 py-1 text-left">{t('colEmail')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validation.apercu.map((row, i) => (
                      <tr key={i}>
                        <td className="border border-gray-200 px-2 py-1 text-gray-400">{row.ligne}</td>
                        <td className="border border-gray-200 px-2 py-1">{String(row.nom ?? '')}</td>
                        <td className="border border-gray-200 px-2 py-1">{String(row.prenom ?? '')}</td>
                        <td className="border border-gray-200 px-2 py-1">{String(row.email ?? '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button onClick={reset} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">{t('annuler')}</button>
            <button onClick={importer} disabled={!validation.valide || loading} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm disabled:opacity-60 hover:bg-primary/90">
              {loading ? t('importEnCours') : t('importer', { count: validation.lignes })}
            </button>
          </div>
        </div>
      )}

      {/* Résultat import */}
      {step === 'result' && result && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{result.succes}</p>
              <p className="text-xs text-gray-500">{t('importes', { count: result.succes })}</p>
            </div>
            {result.erreurs.length > 0 && (
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{result.erreurs.length}</p>
                <p className="text-xs text-gray-500">{t('erreursLabel', { count: result.erreurs.length })}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-700">{result.total}</p>
              <p className="text-xs text-gray-500">{t('total')}</p>
            </div>
          </div>

          {result.erreurs.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto">
              {result.erreurs.map((e, i) => (
                <p key={i} className="text-sm text-red-700">{t('erreurLigne', { ligne: String(e.ligne), message: e.message })}</p>
              ))}
            </div>
          )}

          <button onClick={reset} className="w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">
            {t('nouvelImport')}
          </button>
        </div>
      )}
    </div>
  );
}
