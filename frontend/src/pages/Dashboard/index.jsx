import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDogs } from '../../api/dogs';
import { getAlerts } from '../../api/agents';

const StatusBadge = ({ status }) => {
  const styles = {
    bueno: 'bg-green-100 text-green-700',
    atención: 'bg-yellow-100 text-yellow-700',
    urgente: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status] || styles['bueno']}`}>
      {status}
    </span>
  );
};

const AlertDot = ({ level }) => {
  const styles = {
    roja: 'bg-red-500',
    amarilla: 'bg-yellow-400',
    verde: 'bg-green-500',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${styles[level]}`} />;
};

const DogCard = ({ dog }) => {
  const [alerts, setAlerts] = useState(null);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    getAlerts(dog.id)
      .then((res) => setAlerts(res.data))
      .catch(() => setAlerts(null))
      .finally(() => setLoadingAlerts(false));
  }, [dog.id]);

  const urgentAlerts = alerts?.alerts?.filter((a) => a.level === 'roja') || [];
  const warningAlerts = alerts?.alerts?.filter((a) => a.level === 'amarilla') || [];

  return (
    <Link
      to={`/dogs/${dog.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
            🐶
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{dog.name}</h3>
            <p className="text-sm text-gray-500">{dog.breed || 'Raza no especificada'}</p>
          </div>
        </div>
        {!loadingAlerts && alerts && (
          <StatusBadge status={alerts.overall_status} />
        )}
      </div>

      {!loadingAlerts && (urgentAlerts.length > 0 || warningAlerts.length > 0) && (
        <div className="space-y-2">
          {urgentAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 text-sm">
              <AlertDot level="roja" />
              <span className="text-gray-700">{alert.title}</span>
            </div>
          ))}
          {warningAlerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 text-sm">
              <AlertDot level="amarilla" />
              <span className="text-gray-700">{alert.title}</span>
            </div>
          ))}
        </div>
      )}

      {!loadingAlerts && alerts?.alerts?.length === 0 && (
        <p className="text-sm text-green-600">✓ Todo al día</p>
      )}

      {loadingAlerts && (
        <p className="text-sm text-gray-400">Analizando...</p>
      )}
    </Link>
  );
};

const Dashboard = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDogs()
      .then((res) => setDogs(res.data))
      .catch(() => setError('No se pudieron cargar los perros'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis perros</h1>
          <p className="text-gray-500 mt-1">Resumen de salud actualizado</p>
        </div>
        <Link
          to="/dogs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Añadir perro
        </Link>
      </div>

      {loading && (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500">{error}</div>
      )}

      {!loading && !error && dogs.length === 0 && (
        <div className="text-center py-16">
          <span className="text-6xl">🐾</span>
          <p className="mt-4 text-gray-500">Todavía no has añadido ningún perro</p>
          <Link
            to="/dogs/new"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Añadir mi primer perro
          </Link>
        </div>
      )}

      {!loading && !error && dogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Dashboard;