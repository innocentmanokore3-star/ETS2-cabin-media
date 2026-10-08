document.addEventListener('DOMContentLoaded', () => 
  {
    const telemetry = new TelemetryService();
    const voice = new VoiceEngine();
    const gps = new GPSEngine('map');

      // DOM Element References
    const speedVal = document.getElementById('speedValue');
    const speedLimitVal = document.getElementById('speedLimitValue');
    const gearVal = document.getElementById('gearValue');
    const rpmVal = document.getElementById('rpmValue');
    const fuelVal = document.getElementById('fuelValue');
    const damageVal = document.getElementById('damageValue');
    const connDot = document.getElementById('connectionDot');
    const navText = document.getElementById('navigationText');
    const toggleMockBtn = document.getElementById('toggleMockBtn');
    const muteBtn = document.getElementById('muteBtn');

    const gameEtaVal = document.getElementById('gameEta');
    const realEtaVal = document.getElementById('realEta');

    //React to incoming data
    telemetry.onData((data) => {
      //Update Dom
      if (speedVal) speedVal.textContent = data.speed;
      if (speedLimitVal) speedLimitVal.textContent = data.speedLimit ? `${data.speedLimit} KM/H` : `--`;
      if (gearVal) gearVal.textContent =data.gear;
      if (rpmVal) rpmVal.textContent = data.rpm;
      if (fuelVal) fuelVal.textContent =`${data.fuel}%`;
      if (damageVal) damageVal.textContent = `${data.cargoDamage}%`;

      //Status Indiactor
      if (data.connected) 
      {
        if (connDot) connDot.className = 'status-dot connected';
        if (navText) navText.textContent = data.speed > data.speedLimit
        ? "⚠️ EXCEEDING SPEED LIMIT"
          :"Route Clear - Maintain Speed";
      }
      else 
      {
        if (connDot) connDot.className = 'status-dot disconnected';
        if (navText) navText.textContent =" Disconnected from Truck telemetry";
      }
      if (data.placement && typeof data.placement.x === 'number' && typeof data.placement.z === 'number')
      {
        gps.updatePosition(data.placement.x, data.placement.z);
      }

      if (data.navigation && data.navigation.timeLeftMinutes) {
        const eta = gps.calculateETA(data.navigation.timeLeftMinutes, data.inCity ||false);
        if (gameEtaVal) gameEtaVal.textContent = eta.gameETA;
        if (realEtaval) realEtaVal.textContent = eta.realETA;
      }
      //Pass daata to voice trigger logic
      voice.evaluateTelemetry(data);
    });

    //Event Listeners
    if (toggleMockBtn)
    {
        toggleMockBtn.addEventListener('click', () => 
      {
        telemetry.toggleMock();
      });
    }
      if (muteBtn)
      {
        muteBtn.addEventListener('click',() =>
          {
        const isMuted = voice.toggleMute();
        muteBtn.textContent = isMuted ? '🔇': '🔊';
      });
      }
    //start polling loop 
    telemetry.start();
  });
    
    
