import { useState, useEffect } from 'react';
import PageLayout from '../../components/PageLayout';
import { getSettings, saveSettings } from '../../api/settings';

const PROVIDERS = [
  { value: 'anthropic', label: 'Anthropic (Claude)', placeholder: 'sk-ant-...' },
  { value: 'openai', label: 'OpenAI (GPT-4o)', placeholder: 'sk-...' },
  { value: 'gemini', label: 'Google Gemini', placeholder: 'AIza...' },
];

const Settings = () => {
  const [provider, setProvider] = useState('anthropic');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSettings()
      .then((r) => {
        if (r.data) {
          setProvider(r.data.ai_provider || 'anthropic');
          setApiKey(r.data.ai_api_key || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await saveSettings({ ai_provider: provider, ai_api_key: apiKey });
      setSuccess('Ajustes guardados correctamente');
    } catch {
      setError('No se pudieron guardar los ajustes. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const currentProvider = PROVIDERS.find((p) => p.value === provider);

  return (
    <PageLayout>
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
          <p className="text-gray-500 mt-1">Configura tu proveedor de inteligencia artificial</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-8">Cargando...</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Proveedor de IA
                </label>
                <div className="space-y-2">
                  {PROVIDERS.map((p) => (
                    <label
                      key={p.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        provider === p.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        value={p.value}
                        checked={provider === p.value}
                        onChange={(e) => setProvider(e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-900">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Tu clave se almacena de forma segura y solo se usa para las funciones de IA.
                </p>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentProvider?.placeholder}
                    className="w-full px-4 py-2.5 pr-16 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showKey ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">¿Dónde consigo mi API Key?</p>
                <p>• Anthropic: <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></p>
                <p>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></p>
                <p>• Gemini: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a></p>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
              )}

              {success && (
                <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-lg">{success}</p>
              )}

              <button
                type="submit"
                disabled={saving || !apiKey.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar ajustes'}
              </button>

            </form>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Settings;