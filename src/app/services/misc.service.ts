import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MiscService {
    errorHandler(e) {
        console.error(`"${e.name}: ${e.message}"`);
    }
}
