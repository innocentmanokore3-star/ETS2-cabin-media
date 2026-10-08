document.addEventListener('DOMContentLoaded', () => 
  {
    const telemetry = new TelemetryService();
    const voice = new VoiceEngine();

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

    //React to incoming data
    telemetry.onData((data) => {
      //Update Dom
      speedVal.textContent = data.speed;
      speedLimitVal.textContent = data.speedLimit ? `${data.speedLimit} KM/H` : `--`;
      gearVal.textContent =data.gear;
      rpmVal.textContent = data.rpm;
      fuelVal.textContent =`${data.fuel}%`;
      damageVal.textContent = `${data.cargoDamage}%`;

      //Status Indiactor
      if (data.connected) 
      {
        connDot.className = 'status-dot connected';
        navText.textContent = data.speed > data.speedLimit
        ? "⚠️ EXCEEDING SPEED LIMIT"
          :"Route Clear - Maintain Speed";
      }
      else 
      {
        connDot.className = 'status-dot disconnected';
        navText.textContent =" Disconnected from Truck telemetry";
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
    
    
