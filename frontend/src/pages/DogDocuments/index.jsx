import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDog } from '../../api/dogs';
import { getDocuments, uploadDocument, deleteDocument } from '../../api/documents';
import { analyzeReport } from '../../api/agents';

const DogDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [dog, setDog] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [expandedDoc, setExpandedDoc] = useState(null);

  useEffect(() => {
    getDog(id).then((r) => setDog(r.data)).catch(() => navigate('/dogs'));
  }, [id]);

  useEffect(() => {
    if (!dog) return;
    getDocuments(id)
      .then((r) => setDocuments(r.data))
      .catch(() => setError('No se pudieron cargar los documentos'))
      .finally(() => setLoading(false));
  }, [dog]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Solo se permiten PDF, JPG, PNG o WEBP');
      return;
    }

    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadDocument(id, formData);
      setDocuments((prev) => [res.data.document, ...prev]);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'No se pudo subir el archivo. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  const handleDelete = async (docId) => {
    if (!confirm('¿Eliminar este registro y todos los datos asociados (visita, vacunas, tratamientos)?')) return;
    try {
      await deleteDocument(id, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      setError('No se pudo eliminar el documento');
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setReport('');
    setError('');
    try {
      const res = await analyzeReport(id);
      setReport(res.data.report);
    } catch {
      setError('No se pudo analizar el historial. Comprueba que tienes configurado un proveedor de IA en Ajustes.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatExtractedData = (data) => {
    if (!data) return [];
    const items = [];
    if (data.visit_date) items.push(`📅 Visita: ${new Date(data.visit_date).toLocaleDateString('es-ES')}`);
    if (data.reason) items.push(`🔍 Motivo: ${data.reason}`);
    if (data.diagnosis) items.push(`🩺 Diagnóstico: ${data.diagnosis}`);
    if (data.weight) items.push(`⚖️ Peso: ${data.weight} kg`);
    if (data.vaccines?.length > 0) items.push(`💉 Vacunas: ${data.vaccines.map(v => v.name).join(', ')}`);
    if (data.treatments?.length > 0) items.push(`💊 Tratamientos: ${data.treatments.map(t => t.name).join(', ')}`);
    if (data.allergies?.length > 0) items.push(`⚠️ Alergias: ${data.allergies.map(a => a.name).join(', ')}`);
    if (data.notes) items.push(`📝 Notas: ${data.notes}`);
    return items;
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(`/dogs/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
          ← Volver al perfil
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">📄</span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
            {dog && <p className="text-gray-500">{dog.name}</p>}
          </div>
        </div>

        {/* Subir documento */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Subir informe veterinario</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sube PDFs o imágenes de informes veterinarios. La IA extraerá automáticamente los datos al subirlo.
          </p>

          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {uploading ? (
              <p className="text-gray-400 text-sm">Procesando con IA...</p>
            ) : (
              <>
                <span className="text-3xl">☁️</span>
                <p className="mt-2 text-sm text-gray-600">Haz clic para seleccionar un archivo</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG o WEBP · Máx. 10 MB</p>
              </>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            className="hidden"
          />

          <p className="mt-3 text-xs text-gray-400">
            🔒 El archivo no se almacena. Solo se guardan los datos extraídos para proteger la privacidad.
          </p>

          {uploadError && (
            <p className="mt-3 text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{uploadError}</p>
          )}
        </div>

        {/* Analizar historial completo */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Análisis del historial completo</h2>
              <p className="text-sm text-gray-500 mt-1">
                Genera un informe narrativo del estado de salud de {dog?.name} basado en todo el historial registrado.
              </p>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {analyzing ? 'Analizando...' : 'Analizar'}
            </button>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>
          )}

          {report && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Informe generado</h3>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{report}</div>
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Registros de subidas</h2>

          {loading && (
            <p className="text-gray-400 text-sm text-center py-8">Cargando...</p>
          )}

          {!loading && documents.length === 0 && (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <span className="text-4xl">📂</span>
              <p className="mt-3 text-gray-500 text-sm">No hay documentos procesados todavía</p>
            </div>
          )}

          {!loading && documents.length > 0 && (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">📋</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name || 'Documento'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {expandedDoc === doc.id ? 'Ocultar' : 'Ver datos'}
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-sm text-red-400 hover:text-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {expandedDoc === doc.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {formatExtractedData(doc.extracted_data).length > 0 ? (
                        <ul className="space-y-1">
                          {formatExtractedData(doc.extracted_data).map((item, i) => (
                            <li key={i} className="text-xs text-gray-600">{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-gray-400">No se extrajeron datos de este documento.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  );
};

export default DogDocuments;