class VoiceEngine{
  constructor(){
    this.synth =window.speechSynthesis;
    this.isMuted= false;
    this.lastSpoken={
      speeding: 0,
      damage:0
    };

  //Cooldown in milliseconds between repeated voice trigers
  this.COOLDOWN =12000;
  }
  speak(text){
    if (this.isMuted || !this.synth) return;

  //cancel ongoing speech if new urgent warning triggers
  this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate =1.0;
    utterance.pitch = 0.95;
    //Pick an English voice
  const voices = this.synth.getVoices();
    const selectedVoice = voices.find(v=> v.lang.startsWith('en')) || voices[0];
    if (selectedVoice) utterance.voice =selectedVoice;
    this.synth.speak(utterance);
  }
  toggleMute()
  {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.synth.cancel();
    return this.isMuted;
  }

  evaluateTelemetry(data)
  {
    const now = Date.now();
    //trigger 1: Speeding check
    if(data.speed> data.speedLimit +5 && (now - this.lastSpoken.speeding > this.COOLDOWN))
    {
      const line = this._getRandomline([
        `Slow down! Limit is ${data.speedLimit}, you are doing  ${data.speed}.`,
        'Speed camera ahead! Unless you like paying fines, ease off the gas.',
        'Your 40 ton rig is not a Formula One Car.'
        ]);
      this.speak(line);
      this.lastSpoken.speeding = now;
    }
    // Triger 2 High Cargoo damage 
    if (data.cargoDamage > 10 && (now - this.lastSpoken.damage > this.COOLDOWN))
    {
      this.speak("Cargo damage detected. The client will definitely deduct that from your pay.");
      this.lastSpoken.damage = now;
    }
  }
  _getRandomline(lines)
  {
    return lines[Math.floor(Math.random() * lines.length)];
  }
}





  
