'use client';

import React, { useState } from 'react';

interface AnalysisResult {
  success: boolean;
  analysis?: string;
  error?: string;
}

export default function FinancialAIPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [audioText, setAudioText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setResult(null);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!imageFile && !audioText.trim()) {
      setResult({ success: false, error: 'Envie uma imagem ou transcrição de áudio.' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const body: Record<string, unknown> = {};
      if (imagePreview) {
        body.imageUrl = imagePreview;
      }
      if (audioText.trim()) {
        body.audioTranscription = audioText.trim();
      }

      const response = await fetch('/api/financial-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error?.message ?? 'Erro ao enviar a análise.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Engine Multimodal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Análise financeira automática</h1>
          <p className="mt-3 text-slate-400 max-w-2xl">Envie comprovantes ou transcrições de compra para gerar cálculo de custos e recomendações automáticas.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <label className="block text-sm font-medium text-slate-300">Upload de imagem</label>
          <div className="rounded-3xl border border-dashed border-slate-700 p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer text-sm text-slate-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="mx-auto mt-4 max-h-64 rounded-2xl object-contain" />
            ) : (
              <p className="mt-4 text-sm text-slate-500">Arraste ou selecione uma foto de comprovante para análise.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Transcrição de áudio / observações</label>
            <textarea
              value={audioText}
              onChange={(event) => setAudioText(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-500"
              placeholder="Digite a transcrição do áudio ou descreva os itens do comprovante..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Enviar para análise'}
          </button>
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-white">Resultado</h2>
          {result ? (
            result.success ? (
              <div className="space-y-4 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-slate-100">
                <p className="text-sm text-emerald-300">Análise recebida com sucesso.</p>
                <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{result.analysis}</pre>
              </div>
            ) : (
              <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-200">
                {result.error || 'Erro desconhecido ao processar a solicitação.'}
              </div>
            )
          ) : (
            <div className="rounded-3xl border border-slate-800/80 bg-slate-900 p-4 text-slate-400">
              Use o formulário ao lado para enviar imagem ou texto e ver a análise estruturada aqui.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
