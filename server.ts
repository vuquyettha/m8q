import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory store for webhook events and execution logs
const webhookEvents: Record<string, any[]> = {};
const executionLogs: any[] = [];

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gemini AI API handler
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction, model = 'gemini-2.5-flash' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback response when API key is not configured
      return res.json({
        success: true,
        text: `[AI Simulated Output] Processed prompt: "${prompt?.slice(0, 100)}..." with system logic. (Configure GEMINI_API_KEY in settings for live Gemini model response).`,
        simulated: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    res.json({
      success: true,
      text: response.text || '',
      simulated: false
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error processing AI request'
    });
  }
});

// Webhook listener endpoint
app.all('/api/webhook/:webhookId', (req, res) => {
  const { webhookId } = req.params;
  const payload = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    webhookId,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString(),
  };

  if (!webhookEvents[webhookId]) {
    webhookEvents[webhookId] = [];
  }
  webhookEvents[webhookId].unshift(payload);
  if (webhookEvents[webhookId].length > 50) {
    webhookEvents[webhookId].pop();
  }

  res.status(200).json({
    status: 'success',
    message: `Webhook ${webhookId} received successfully`,
    receivedPayload: payload
  });
});

// Get webhook events
app.get('/api/webhooks/:webhookId/events', (req, res) => {
  const { webhookId } = req.params;
  res.json({
    events: webhookEvents[webhookId] || []
  });
});

// Execute Workflow endpoint
app.post('/api/workflow/execute', (req, res) => {
  const { workflow, triggerData } = req.body;
  
  const executionId = `exec_${Date.now()}`;
  const startedAt = new Date().toISOString();
  
  // Return execution acknowledgement
  res.json({
    executionId,
    startedAt,
    status: 'queued',
    message: 'Workflow execution received'
  });
});

// Server boot with Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PyFlow Automation Studio running on port ${PORT}`);
  });
}

startServer();
