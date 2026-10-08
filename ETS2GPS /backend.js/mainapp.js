document.addEventListener('DOMContentLoaded', () => 
  {
    const telemetry = new Telemetryservice();
    const voice = new VoiceEngine();

      // DOM Element References
    const speedVal = document.getElementById('SpeedValue');
    const speedLimitVal = document.getElemenById("speedLimitValue');
    const gearVal = document.getElemenById('gearValue');
    const rpmVal = document.getElemenById('rpmValue');
    const fuelVal = document.getElemenById('fuelValue');
    const damageVal = document.getElemenById('damageValue');
    const connDot = document.getElemenById('connectionDot');
    const navText = document.getElemenById('navigationText');
    const toggleMockBtn = document.getElemenById('toggleMockBtn');
    const muteBtn = document.getElemenById('muteBtn');

    //React to incoming data
    telemetry.onData((data) => {
      //Update Dom
      speedVal.textContent = data.speed;
      speedLimitVal.textContent = data.speedlimit ? '$data.SpeedLimit} KM/H' : '--';
      gearVal.textContent =data.gear;
      rpmVal.textContent = data.rpm;
      fuelVal.textContent ='${data.fuel}%';
      damageVal.textContent = '$data.cargoDamage}%';

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
        connDot.className = 'stays-dot disconnected';
        navText.textContent =" Disconnected from Truck telemetry";
      }
      //Pass daata to voice trigger logic
      voice.evaluateTelemetry(data);
    });

    //Event Listeners
    toggleMockBtn.addEventListener('click', () => 
      {
        const isMuted = voice.toggleMute();
        muteBtn.TectContent = isMuted ? '🔇': '🔊';
      });
    //start polling loop 
    telemetry.start();
  });
    
    
