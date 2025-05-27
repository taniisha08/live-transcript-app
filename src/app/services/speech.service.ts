// src/app/services/speech.service.ts
import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: any;
  private silenceTimer: any;
  private sentenceStartTime: string | null = null;
  private readonly SILENCE_TIMEOUT = 1500;
  private isSpeaking = false;
  private transcriptSubject = new BehaviorSubject<
  { speaker: string; sentence: string; startTime: string; endTime: string }[]
>([]);
  // private transcriptSubject = new BehaviorSubject<{ speaker: string; sentence: string; timestamp: string }[]>([]);
  private liveSentenceSubject = new BehaviorSubject<string>('');
  private speakingStatusSubject = new BehaviorSubject<boolean>(false);

  transcript$ = this.transcriptSubject.asObservable();
  liveSentence$ = this.liveSentenceSubject.asObservable();
  speakingStatus$ = this.speakingStatusSubject.asObservable();

  private shouldKeepListening = true;

  constructor(private ngZone: NgZone) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API not supported in this browser');
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
            const current = this.liveSentenceSubject.getValue();
            this.liveSentenceSubject.next(current + result[0].transcript + ' ');
          } else {
            interim += result[0].transcript;
          }
        }

        if (!this.sentenceStartTime) {
          this.sentenceStartTime = this.getCurrentTimestamp();
        }

        this.resetSilenceTimer();
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event);
    };

    this.recognition.onend = () => {
      if (this.shouldKeepListening) {
        this.recognition.start();
      }
    };
  }

  private resetSilenceTimer() {
    clearTimeout(this.silenceTimer);
    this.isSpeaking = true;
    this.speakingStatusSubject.next(true);
  
    this.silenceTimer = setTimeout(() => {
      this.isSpeaking = false;
      this.speakingStatusSubject.next(false);
  
      const liveSentence = this.liveSentenceSubject.getValue().trim();
      if (liveSentence) {
        const currentTranscript = this.transcriptSubject.getValue();
        const endTime = this.getCurrentTimestamp();
        currentTranscript.push({
          speaker: 'candidate',
          sentence: liveSentence,
          startTime: this.sentenceStartTime || endTime,
          endTime: endTime
        });
        this.transcriptSubject.next(currentTranscript);
        this.liveSentenceSubject.next('');
        this.sentenceStartTime = null;
      }
    }, this.SILENCE_TIMEOUT);
  }

  private getCurrentTimestamp(): string {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  public startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (err) {
        console.warn('Recognition already started.');
      }
    }
  }

  public stopListening() {
    this.shouldKeepListening = false;
    this.recognition.stop();
  }
}