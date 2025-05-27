// src/app/services/mic-level.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MicLevelService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private volumeSubject = new BehaviorSubject<number>(0);
  volume$ = this.volumeSubject.asObservable();

  async initMicLevel() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      source.connect(this.analyser);

      this.updateVolume();
    } catch (error) {
      console.error('Mic access failed:', error);
    }
  }

  private updateVolume() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const animate = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      // Normalize to 0-100 for UI
      const normalized = Math.min(100, (average / 80) * 100);
      this.volumeSubject.next(normalized);

      requestAnimationFrame(animate);
    };

    animate();
  }
}