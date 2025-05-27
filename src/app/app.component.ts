// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { SpeechService } from './services/speech.service';

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

  constructor(public speechService: SpeechService) {}

  ngOnInit(): void {
    this.speechService.transcript$.subscribe(data => this.transcript = data);
    this.speechService.liveSentence$.subscribe(data => this.liveSentence = data);
    this.speechService.speakingStatus$.subscribe(status => this.isSpeaking = status);
 
  }

  startListening () {
    this.speechService.startListening();
  }

  stopListening() {
    this.speechService.stopListening();
  }
}