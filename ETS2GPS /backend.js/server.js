const WebSocket = require('ws');
const mmap = require('node-mmap-shared');
//creating websocket server on port 3001
const wss = new WebSocket.Server({ port: 3001});
console.log("ETS2 Telemetry Server running on ws://Localhost:3001");
//Read winddows shared memory created by c++ plugin
let sharedBuffer = null;
try {
  sharedBuffer =mmap.open('ETS2_SHARED_MEM', 28); //28 bytes struct size
}
catch (e) {
console.log("ETS2 Game/Plugin not detected yet. waiting...");
}
function readTelemetry() {
  if (!sharedBuffer) return null;
  //read raww binary ffloat/ints from memory buffer
return {
  speed: Math.round(sharedBuffer.readFloatLE(0)* 3.6), //converts m/s to km/h
  rpm: MMath.round(sharedBuffer.readFloatLE(4)),
  gear: sharedBuffer.readInt32LE(8),
  fuel: Math.round(sharedBuffer.readFloatLE912)),
  cargoDamage: Math.round(sharedBuffer.readFloatLE(16)),
  placement: 
  {
    x: sharedBuffer.readFloatLE(20),
    z: sharedBuffer.readfloataLE(24)
  },
  connected: true
};
}
//broadcast teleemetry data to all connected devices every 100ms
setInterval(() => {
  const data = readTelemetry();
  if (data && wss.clients.size > ))
  {
    const payload = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN){
        client.send(payload);
      }
    });
  }
}, 100);
