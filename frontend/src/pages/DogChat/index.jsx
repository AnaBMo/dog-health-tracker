import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { getDog } from '../../api/dogs';
import { sendChatMessage } from '../../api/agents';

const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
};

const SUGGESTIONS = [
  '¿Cuándo fue la última visita al veterinario?',
  '¿Tiene alguna vacuna pendiente?',
  '¿Qué tratamientos ha tenido?',
  '¿Tiene alergias conocidas?',
];

const DogChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dog, setDog] = useState(null);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    getDog(id).then((r) => setDog(r.data)).catch(() => navigate('/dogs'));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setError('');

    const userMsg = { role: 'user', content: text };
    const newHistory = [...history, userMsg];
    setHistory(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(id, text, history);
      setHistory(res.data.updated_history);
    } catch {
      setError('No se pudo enviar el mensaje. Comprueba que tienes configurado un proveedor de IA en Ajustes.');
      setHistory(history);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">

        {/* Cabecera */}
        <div className="mb-4">
          <button onClick={() => navigate(`/dogs/${id}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Volver al perfil
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💬</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Consultar IA</h1>
              {dog && <p className="text-gray-500">Pregunta sobre la salud de {dog.name}</p>}
            </div>
          </div>
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {history.length === 0 && !loading && (
            <div className="text-center py-8">
              <span className="text-5xl">🐾</span>
              <p className="mt-4 text-gray-500 text-sm">
                Haz una pregunta sobre la salud de {dog?.name}
              </p>
              <div className="mt-6 space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="block w-full text-left text-sm text-gray-600 bg-white border border-gray-100 rounded-xl px-4 py-2.5 hover:border-blue-300 hover:text-blue-600 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-600 text-sm">{error}</div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Escribe tu pregunta..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
            >
              Enviar
            </button>
          </div>
        </form>

      </div>
    </PageLayout>
  );
};

export default DogChat;