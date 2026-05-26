const EmptyState = ({ emoji = '📋', message, action }) => (
  <div className="text-center py-12">
    <span className="text-4xl">{emoji}</span>
    <p className="mt-3 text-gray-500 text-sm">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;