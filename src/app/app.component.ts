import { Component, NgZone } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  transcript: { speaker: string; sentence: string; timestamp: string }[] = [];
  liveSentence = '';
  isSpeaking = false;
  recognition: any;
  silenceTimeout: any;
  sentenceStartTime: string | null = null;
  SILENCE_TIMEOUT = 2000;
  // ✅ Safeguard to control auto-restart
  private shouldKeepListening = true;

  constructor(private ngZone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-IN';

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            this.liveSentence += result[0].transcript + ' ';
          } else {
            interim += result[0].transcript;
          }
        }

        if (!this.sentenceStartTime) {
          this.sentenceStartTime = this.getCurrentTimestamp();
        }

        this.resetSilenceDetection();
      });
    };

    this.recognition.onerror = (err: any) => {
      console.error('Speech recognition error:', err);
    };

    // ✅ Auto-restart recognition only if allowed
    this.recognition.onend = () => {
      console.warn('Speech recognition ended.');
      if (this.shouldKeepListening) {
        console.warn('Restarting...');
        this.recognition.start();
      }
    };
  }

  getCurrentTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  }

  resetSilenceDetection() {
    clearTimeout(this.silenceTimeout);
    this.isSpeaking = true;

    this.silenceTimeout = setTimeout(() => {
      this.isSpeaking = false;

      if (this.liveSentence.trim()) {
        this.transcript.push({
          speaker: 'candidate',
          sentence: this.liveSentence.trim(),
          timestamp: this.sentenceStartTime || this.getCurrentTimestamp()
        });

        this.liveSentence = '';
        this.sentenceStartTime = null;
      }
    }, this.SILENCE_TIMEOUT);
  }

  startListening() {
    this.shouldKeepListening = true;
    if (this.recognition) {
      this.recognition.start();
    }
  }

  stopListening() {
    this.shouldKeepListening = false;

    if (this.recognition) {
      this.recognition.stop();
    }
  }
}