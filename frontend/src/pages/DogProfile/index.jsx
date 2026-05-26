import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import TabNav from '../../components/TabNav';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { getDog, updateDog } from '../../api/dogs';
import {
  getVetVisits, createVetVisit, deleteVetVisit,
  getVaccines, createVaccine, deleteVaccine,
  getTreatments, createTreatment, deleteTreatment,
  getAllergies, createAllergy, deleteAllergy,
} from '../../api/health';

const TABS = [
  { key: 'visits', label: 'Visitas' },
  { key: 'vaccines', label: 'Vacunas' },
  { key: 'treatments', label: 'Tratamientos' },
  { key: 'allergies', label: 'Alergias' },
];

const formatDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—';

// ── Visitas ──────────────────────────────────────────────
const VisitsTab = ({ dogId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ visit_date: '', reason: '', diagnosis: '', notes: '', weight: '' });

  useEffect(() => {
    getVetVisits(dogId).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, [dogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createVetVisit(dogId, { ...form, weight: form.weight ? parseFloat(form.weight) : null });
    setItems((prev) => [res.data, ...prev]);
    setShowModal(false);
    setForm({ visit_date: '', reason: '', diagnosis: '', notes: '', weight: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta visita?')) return;
    await deleteVetVisit(dogId, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nueva visita
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🏥" message="No hay visitas registradas" action={{ label: 'Añadir visita', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{formatDate(item.visit_date)}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.reason || '—'}</p>
                  {item.diagnosis && <p className="text-sm text-gray-500 mt-1">Diagnóstico: {item.diagnosis}</p>}
                  {item.weight && <p className="text-sm text-gray-500 mt-1">Peso: {item.weight} kg</p>}
                  {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nueva visita veterinaria" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input type="date" required value={form.visit_date} onChange={(e) => setForm((p) => ({ ...p, visit_date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <input type="text" value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: Revisión anual" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico</label>
              <input type="text" value={form.diagnosis} onChange={(e) => setForm((p) => ({ ...p, diagnosis: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: 12.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ── Vacunas ──────────────────────────────────────────────
const VaccinesTab = ({ dogId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', date: '', next_date: '', notes: '' });

  useEffect(() => {
    getVaccines(dogId).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, [dogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createVaccine(dogId, form);
    setItems((prev) => [res.data, ...prev]);
    setShowModal(false);
    setForm({ name: '', date: '', next_date: '', notes: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta vacuna?')) return;
    await deleteVaccine(dogId, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nueva vacuna
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="💉" message="No hay vacunas registradas" action={{ label: 'Añadir vacuna', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500 mt-1">Administrada: {formatDate(item.date)}</p>
                  {item.next_date && <p className="text-sm text-gray-500">Próxima dosis: {formatDate(item.next_date)}</p>}
                  {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nueva vacuna" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: Rabia" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima dosis</label>
                <input type="date" value={form.next_date} onChange={(e) => setForm((p) => ({ ...p, next_date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ── Tratamientos ─────────────────────────────────────────
const TreatmentsTab = ({ dogId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', date: '', next_date: '', notes: '' });

  useEffect(() => {
    getTreatments(dogId).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, [dogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createTreatment(dogId, form);
    setItems((prev) => [res.data, ...prev]);
    setShowModal(false);
    setForm({ name: '', type: '', date: '', next_date: '', notes: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este tratamiento?')) return;
    await deleteTreatment(dogId, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nuevo tratamiento
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="💊" message="No hay tratamientos registrados" action={{ label: 'Añadir tratamiento', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.type && <p className="text-sm text-blue-600 mt-0.5">{item.type}</p>}
                  <p className="text-sm text-gray-500 mt-1">Fecha: {formatDate(item.date)}</p>
                  {item.next_date && <p className="text-sm text-gray-500">Próxima aplicación: {formatDate(item.next_date)}</p>}
                  {item.notes && <p className="text-sm text-gray-400 mt-1">{item.notes}</p>}
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nuevo tratamiento" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: Antiparasitario" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <input type="text" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: Desparasitación" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" required value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próxima aplicación</label>
                <input type="date" value={form.next_date} onChange={(e) => setForm((p) => ({ ...p, next_date: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ── Alergias ─────────────────────────────────────────────
const AllergiesTab = ({ dogId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', severity: 'leve', notes: '' });

  useEffect(() => {
    getAllergies(dogId).then((r) => setItems(r.data)).finally(() => setLoading(false));
  }, [dogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await createAllergy(dogId, form);
    setItems((prev) => [res.data, ...prev]);
    setShowModal(false);
    setForm({ name: '', severity: 'leve', notes: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta alergia?')) return;
    await deleteAllergy(dogId, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const severityStyle = { leve: 'bg-green-100 text-green-700', moderada: 'bg-yellow-100 text-yellow-700', alta: 'bg-red-100 text-red-700' };

  if (loading) return <p className="text-gray-400 text-sm py-8 text-center">Cargando...</p>;

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nueva alergia
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🌿" message="No hay alergias registradas" action={{ label: 'Añadir alergia', onClick: () => setShowModal(true) }} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${severityStyle[item.severity] || severityStyle.leve}`}>
                    {item.severity}
                  </span>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 text-sm">Eliminar</button>
              </div>
              {item.notes && <p className="text-sm text-gray-400 mt-2">{item.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nueva alergia" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" placeholder="Ej: Polen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
              <select value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

// ── Página principal ─────────────────────────────────────
const DogProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dog, setDog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    getDog(id)
      .then((r) => setDog(r.data))
      .catch(() => navigate('/dogs'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLayout><div className="text-center py-16 text-gray-400">Cargando...</div></PageLayout>;
  if (!dog) return null;

  return (
    <PageLayout>
      {/* Cabecera */}
      <div className="mb-8">
        <button onClick={() => navigate('/dogs')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← Volver
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">🐶</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dog.name}</h1>
              <p className="text-gray-500">
                {dog.breed || 'Raza no especificada'}
                {dog.birth_date && ` · Nacido en ${new Date(dog.birth_date).getFullYear()}`}
                {dog.weight && ` · ${dog.weight} kg`}
              </p>
            </div>
          </div>
        </div>

        {/* Accesos a agentes */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to={`/dogs/${id}/alerts`} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">🔔</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Alertas</p>
          </Link>
          <Link to={`/dogs/${id}/tracking`} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">📊</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Seguimiento</p>
          </Link>
          <Link to={`/dogs/${id}/chat`} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">💬</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Consultar IA</p>
          </Link>
          <Link to={`/dogs/${id}/documents`} className="bg-white border border-gray-100 rounded-xl p-3 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl">📄</span>
            <p className="text-xs font-medium text-gray-700 mt-1">Documentos</p>
          </Link>
        </div>
      </div>

      {/* Pestañas */}
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'visits' && <VisitsTab dogId={id} />}
        {activeTab === 'vaccines' && <VaccinesTab dogId={id} />}
        {activeTab === 'treatments' && <TreatmentsTab dogId={id} />}
        {activeTab === 'allergies' && <AllergiesTab dogId={id} />}
      </div>
    </PageLayout>
  );
};

export default DogProfile;