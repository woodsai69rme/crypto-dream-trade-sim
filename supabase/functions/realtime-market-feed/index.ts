import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Mock market data streams for different symbols
  const symbols = ['BTC', 'ETH', 'SOL', 'ADA', 'DOT'];
  let intervalId: number;

  socket.onopen = () => {
    console.log("Client connected to real-time market feed");
    
    // Send initial market data
    symbols.forEach(symbol => {
      const price = Math.random() * 50000 + 30000;
      socket.send(JSON.stringify({
        type: 'price_update',
        symbol,
        price: price.toFixed(2),
        change_24h: (Math.random() - 0.5) * 10,
        volume: Math.random() * 1000000000,
        timestamp: new Date().toISOString()
      }));
    });

    // Send periodic updates every 5 seconds
    intervalId = setInterval(() => {
      symbols.forEach(symbol => {
        const price = Math.random() * 50000 + 30000;
        socket.send(JSON.stringify({
          type: 'price_update',
          symbol,
          price: price.toFixed(2),
          change_24h: (Math.random() - 0.5) * 10,
          volume: Math.random() * 1000000000,
          timestamp: new Date().toISOString()
        }));
      });

      // Send trading signals occasionally
      if (Math.random() > 0.7) {
        const signal = {
          type: 'trading_signal',
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          signal_type: Math.random() > 0.5 ? 'buy' : 'sell',
          strength: Math.floor(Math.random() * 100),
          confidence: Math.floor(Math.random() * 100),
          price_target: Math.random() * 60000 + 40000,
          source: 'AI Analysis',
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(signal));
      }

      // Send risk alerts occasionally
      if (Math.random() > 0.8) {
        const alert = {
          type: 'risk_alert',
          risk_type: 'position_concentration',
          risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          current_value: Math.random() * 100,
          threshold_value: 75,
          message: 'Portfolio concentration exceeding limits',
          timestamp: new Date().toISOString()
        };
        socket.send(JSON.stringify(alert));
      }
    }, 5000);
  };

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
      
      // Handle client requests for specific data
      switch (message.type) {
        case 'subscribe':
          socket.send(JSON.stringify({
            type: 'subscription_confirmed',
            symbols: message.symbols || symbols,
            timestamp: new Date().toISOString()
          }));
          break;
        case 'trade_executed':
          // Broadcast trade execution to all connected clients
          socket.send(JSON.stringify({
            type: 'trade_confirmation',
            trade_id: message.trade_id,
            status: 'executed',
            timestamp: new Date().toISOString()
          }));
          break;
        default:
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
            timestamp: new Date().toISOString()
          }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString()
      }));
    }
  };

  socket.onclose = () => {
    console.log("Client disconnected from real-time market feed");
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  return response;
});