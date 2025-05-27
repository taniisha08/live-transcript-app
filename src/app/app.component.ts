// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { SpeechService } from './services/speech.service';
import { MicLevelService } from './services/mic-level.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // transcript: { speaker: string; sentence: string; timestamp: string }[] = [];
  transcript: { speaker: string; sentence: string; startTime: string; endTime: string }[] = [];
  liveSentence: string = '';
  isSpeaking = false;
  micVolume: number = 0;

  constructor(
    private speechService: SpeechService,
    private micService: MicLevelService
  ) {}


  ngOnInit(): void {
    // speech recognition
    this.speechService.transcript$.subscribe(data => this.transcript = data);
    this.speechService.liveSentence$.subscribe(data => this.liveSentence = data);
    this.speechService.speakingStatus$.subscribe(status => this.isSpeaking = status);
    this.speechService.startListening(); 

    //mic level visualiser
    this.micService.initMicLevel();
    this.micService.volume$.subscribe(volume => {
      this.micVolume = volume;
    });
  }


  stopListening() {
    this.speechService.stopListening();
  }
}