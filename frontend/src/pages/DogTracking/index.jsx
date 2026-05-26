import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDog } from '../../api/dogs';
import { getTracking } from '../../api/agents';

const priorityConfig = {
  urgente: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: '🚨' },
  media: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
  baja: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: '💡' },
};

const categoryIcon = {
  vacuna: '💉',
  tratamiento: '💊',
  visita: '🏥',
  peso: '⚖️',
  general: '📋',
};

const RecommendationCard = ({ rec }) => {
  const config = priorityConfig[rec.priority] || priorityConfig.baja;
  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{categoryIcon[rec.category] || '📋'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900">{rec.title}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
              {rec.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
          {rec.due_date && (
            <p className="text-xs text-gray-400 mt-2">
              Fecha recomendada: {new Date(rec.due_date).toLocaleDateString('es-ES')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const statusConfig = {
  bueno: { bg: 'bg-green-100', text: 'text-green-700', label: 'Estado general: Bueno' },
  atención: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Estado general: Requiere atención' },
  urgente: { bg: 'bg-red-100', text: 'text-red-700', label: 'Estado general: Urgente' },
};

const DogTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dog, setDog] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDog(id).then((r) => setDog(r.data)).catch(() => navigate('/dogs'));
  }, [id]);

  useEffect(() => {
    if (!dog) return;
    getTracking(id)
      .then((r) => setResult(r.data))
      .catch(() => setError('No se pudo cargar el seguimiento. Comprueba que tienes configurado un proveedor de IA en Ajustes.'))
      .finally(() => setLoading(false));
  }, [dog]);

  const urgentes = result?.recommendations?.filter((r) => r.priority === 'urgente') || [];
  const medias = result?.recommendations?.filter((r) => r.priority === 'media') || [];
  const bajas = result?.recommendations?.filter((r) => r.priority === 'baja') || [];

  const status = result?.overall_status;
  const statusStyle = statusConfig[status] || statusConfig.bueno;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/dogs/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← Volver al perfil
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seguimiento proactivo</h1>
            {dog && <p className="text-gray-500">{dog.name}</p>}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-400">Analizando historial de salud...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
        )}

        {!loading && result && (
          <div className="space-y-6">
            {/* Estado general */}
            <div className={`rounded-xl px-4 py-3 ${statusStyle.bg}`}>
              <p className={`text-sm font-medium ${statusStyle.text}`}>{statusStyle.label}</p>
              <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
            </div>

            {result.recommendations.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-5xl">✅</span>
                <p className="mt-4 text-gray-600 font-medium">Sin recomendaciones pendientes</p>
                <p className="text-gray-400 text-sm mt-1">El seguimiento de {dog?.name} está al día</p>
              </div>
            ) : (
              <>
                {urgentes.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Urgente</h2>
                    {urgentes.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                  </div>
                )}
                {medias.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Próximamente</h2>
                    {medias.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                  </div>
                )}
                {bajas.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Sugerencias</h2>
                    {bajas.map((r, i) => <RecommendationCard key={i} rec={r} />)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default DogTracking;