import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getItem<T>(key: string): T {
    return JSON.parse(localStorage.getItem(key)) as T;
  }
}
