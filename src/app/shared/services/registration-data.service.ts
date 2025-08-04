import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RegistrationDataService {
  private data: any = {};

  setData(key: string, value: any) {
    this.data[key] = value;
  }

  getData(key: string) {
    return this.data[key];
  }
}