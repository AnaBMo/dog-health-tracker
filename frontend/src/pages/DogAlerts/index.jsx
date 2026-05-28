import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDog } from '../../api/dogs';
import { getAlerts } from '../../api/agents';

const levelConfig = {
  roja: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'Urgente' },
  amarilla: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400', label: 'Atención' },
  verde: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Informativo' },
};

const AlertCard = ({ alert }) => {
  const config = levelConfig[alert.level] || levelConfig.verde;
  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dot}`} />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-900">{alert.title}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
          {alert.due_date && (
            <p className="text-xs text-gray-400 mt-2">
              Fecha límite: {new Date(alert.due_date).toLocaleDateString('es-ES')}
              {alert.days_until !== null && (
                <span className="ml-1">
                  ({alert.days_until < 0
                    ? `hace ${Math.abs(alert.days_until)} días`
                    : alert.days_until === 0
                    ? 'hoy'
                    : `en ${alert.days_until} días`})
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const calculateUpcomingAlerts = (records) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const alerts = [];

  const daysUntil = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return Math.round((d - today) / (1000 * 60 * 60 * 24));
  };

  // Vacunas con next_date
  (records.vaccines || []).forEach((v) => {
    if (!v.next_date) return;
    const days = daysUntil(v.next_date);
    if (days > 30) return; // solo mostramos las próximas 30 días o vencidas
    alerts.push({
      id: `upcoming_vaccine_${v.id}`,
      level: days < 0 ? 'roja' : days <= 14 ? 'amarilla' : 'verde',
      category: 'vacuna',
      title: `Vacuna: ${v.name}`,
      message: days < 0
        ? `La próxima dosis debería haberse administrado hace ${Math.abs(days)} días.`
        : days === 0
        ? 'La próxima dosis es hoy.'
        : `La próxima dosis está programada en ${days} días.`,
      due_date: v.next_date,
      days_until: days,
    });
  });

  // Tratamientos con next_date
  (records.treatments || []).forEach((t) => {
    if (!t.next_date) return;
    const days = daysUntil(t.next_date);
    if (days > 30) return;
    alerts.push({
      id: `upcoming_treatment_${t.id}`,
      level: days < 0 ? 'roja' : days <= 14 ? 'amarilla' : 'verde',
      category: 'tratamiento',
      title: `Tratamiento: ${t.name}`,
      message: days < 0
        ? `La próxima aplicación de ${t.name} debería haberse realizado hace ${Math.abs(days)} días.`
        : days === 0
        ? `La próxima aplicación de ${t.name} es hoy.`
        : `La próxima aplicación de ${t.name} está programada en ${days} días.`,
      due_date: t.next_date,
      days_until: days,
    });
  });

  return alerts;
};

const DogAlerts = () => {
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
    getAlerts(id)
      .then((r) => setResult(r.data))
      .catch(() => setError('No se pudieron cargar las alertas. Comprueba que tienes configurado un proveedor de IA en Ajustes.'))
      .finally(() => setLoading(false));
  }, [dog]);

  const upcomingAlerts = result?.records ? calculateUpcomingAlerts(result.records) : [];

  // Combinar alertas de IA con las calculadas, evitando duplicados por fecha+categoría
  const aiSignatures = new Set(
    (result?.alerts || [])
      .filter((a) => a.due_date && a.category)
      .map((a) => `${a.category}_${a.due_date}`)
  );
  const uniqueUpcoming = upcomingAlerts.filter(
    (a) => !aiSignatures.has(`${a.category}_${a.due_date}`)
  );
  const allAlerts = [...(result?.alerts || []), ...uniqueUpcoming];

  const rojas = allAlerts.filter((a) => a.level === 'roja');
  const amarillas = allAlerts.filter((a) => a.level === 'amarilla');
  const verdes = allAlerts.filter((a) => a.level === 'verde');

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/dogs/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← Volver al perfil
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">🔔</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alertas</h1>
            {dog && <p className="text-gray-500">{dog.name}</p>}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <p className="text-gray-400">Analizando el estado de salud...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">{error}</div>
        )}

        {!loading && result && (
          <>
            {allAlerts.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-5xl">✅</span>
                <p className="mt-4 text-gray-600 font-medium">Todo al día</p>
                <p className="text-gray-400 text-sm mt-1">{result.summary}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {result.summary && (
                  <p className="text-gray-600 text-sm bg-gray-100 rounded-xl px-4 py-3">{result.summary}</p>
                )}

                {rojas.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Urgente</h2>
                    {rojas.map((a) => <AlertCard key={a.id} alert={a} />)}
                  </div>
                )}

                {amarillas.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wide">Atención</h2>
                    {amarillas.map((a) => <AlertCard key={a.id} alert={a} />)}
                  </div>
                )}

                {verdes.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wide">Informativo</h2>
                    {verdes.map((a) => <AlertCard key={a.id} alert={a} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default DogAlerts;