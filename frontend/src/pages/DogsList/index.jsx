import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDogs, deleteDog } from '../../api/dogs';

const DogsList = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getDogs()
      .then((res) => setDogs(res.data))
      .catch(() => setError('No se pudieron cargar los perros'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (dog) => {
    if (!confirm(`¿Seguro que quieres eliminar a ${dog.name}? Esta acción no se puede deshacer.`)) return;
    setDeleting(dog.id);
    try {
      await deleteDog(dog.id);
      setDogs((prev) => prev.filter((d) => d.id !== dog.id));
    } catch {
      setError('No se pudo eliminar el perro');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis perros</h1>
          <p className="text-gray-500 mt-1">{dogs.length} {dogs.length === 1 ? 'perro registrado' : 'perros registrados'}</p>
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
        <div className="space-y-3">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between"
            >
              <div
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => navigate(`/dogs/${dog.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                  🐶
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{dog.name}</h3>
                  <p className="text-sm text-gray-500">
                    {dog.breed || 'Raza no especificada'}
                    {dog.birth_date && ` · ${new Date(dog.birth_date).getFullYear()}`}
                    {dog.weight && ` · ${dog.weight} kg`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/dogs/${dog.id}`)}
                  className="text-sm text-blue-600 hover:underline px-3 py-1.5"
                >
                  Ver perfil
                </button>
                <button
                  onClick={() => handleDelete(dog)}
                  disabled={deleting === dog.id}
                  className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 disabled:opacity-50"
                >
                  {deleting === dog.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default DogsList;