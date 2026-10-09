class TelemetryService
{
  constructor()
  {
    this.callback = null;
    this.ws == null;
    //replace with your PC,s local IP address
  this.pcIp = "192.168.1.100";
  }
  onData(cb)
  {
    this.callback =cb;
  }
  start()
  {
    this.ws = new WebSocket(`ws://${this.pcIp}:3001`);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.callback) 
      {
        this.callback(data);
      }
    };
    this.ws.onerror= (error) => {
      console.warn("WebSocket connection error. is the servr running?");
    };
  }
}
