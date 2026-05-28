# 🐾 Dog Health Tracker

Una aplicación open source para el seguimiento de la salud de tus perros, con integración de agentes de inteligencia artificial.

## ¿Qué es Dog Health Tracker?

Dog Health Tracker te permite centralizar toda la información de salud de tus mascotas: visitas veterinarias, vacunas, tratamientos, alergias y documentos médicos — todo en un solo lugar.

Además, incluye agentes de IA que analizan el historial de tu perro, detectan alertas, generan informes de seguimiento y responden preguntas sobre su salud.

## ✨ Funcionalidades

- 🐕 Gestión de múltiples perros
- 🏥 Registro de visitas veterinarias, vacunas, tratamientos y alergias
- 📄 Extracción automática de datos desde documentos médicos (imágenes y PDFs) mediante IA
- 🤖 Agentes de IA:
  - **Análisis de salud**: resumen del estado general del perro
  - **Seguimiento**: evolución y tendencias a lo largo del tiempo
  - **Alertas**: detección de situaciones que requieren atención
  - **Chat**: preguntas y respuestas sobre la salud de tu perro
- ⚙️ Elección del proveedor de IA: Anthropic, OpenAI o Gemini
- 🔒 Autenticación segura y datos privados por usuario

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) con RLS |
| IA | Anthropic Claude / OpenAI GPT-4o / Google Gemini |

## 🤖 Configuración del proveedor de IA

La app permite elegir entre tres proveedores de IA desde los ajustes. Cada uno requiere una API Key con acceso a los modelos que usa la aplicación:

| Proveedor | Modelo | Dónde obtener la API Key | Coste |
|---|---|---|---|
| **Anthropic** | `claude-sonnet-4-20250514` | [console.anthropic.com](https://console.anthropic.com) | De pago, requiere créditos |
| **OpenAI** | `gpt-4o` | [platform.openai.com](https://platform.openai.com) | De pago, requiere créditos |
| **Gemini** | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com) | ✅ Tier gratuito disponible |


## 📄 Licencia

MIT © 2026 AnaBMo