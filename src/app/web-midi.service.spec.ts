import { TestBed, inject } from '@angular/core/testing';

import { WebMidiService } from './web-midi.service';

describe('WebMidiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebMidiService]
    });
  });

  it('should be created', inject([WebMidiService], (service: WebMidiService) => {
    expect(service).toBeTruthy();
  }));
});
