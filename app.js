const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');
const WebSocket = require('ws');
const actions = require('./actions');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/static', express.static(path.join(__dirname, 'static')));
// Add this line to serve static images
app.use('/images', express.static('images'));


// WebSocket for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('🔗 WebSocket client connected');
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to Pinnacle AI/RPA Demo' }));
});

// Broadcast function for real-time updates
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// API Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Execute AI/RPA action
app.post('/api/action', async (req, res) => {
  const { actionName, payload } = req.body;
  
  if (!actionName || !actions[actionName]) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid or missing actionName',
      available: Object.keys(actions)
    });
  }

  try {
    broadcast({ type: 'status', message: `Starting ${actionName}...` });
    
    const result = await actions[actionName](payload, (progress) => {
      broadcast({ type: 'progress', data: progress });
    });
    
    broadcast({ type: 'complete', message: `${actionName} completed successfully` });
    res.json({ success: true, result });
  } catch (error) {
    console.error('Action error:', error);
    broadcast({ type: 'error', message: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload and process document
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const result = await actions.processDocument({ filePath });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get system status and analytics
app.get('/api/status', async (req, res) => {
  try {
    const status = await actions.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available actions
app.get('/api/actions', (req, res) => {
  const actionList = Object.keys(actions).map(name => ({
    name,
    description: actions[name].description || `${name} operation`,
    category: actions[name].category || 'General'
  }));
  res.json(actionList);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Pinnacle AI/RPA Demo Server running on port ${PORT}`);
  console.log(`📊 WebSocket server running on port 8080`);
  console.log(`🌐 Access the demo at: http://localhost:${PORT}`);
});