
import { fromEvent, of, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export default function runTest(){
    const online$: Observable<boolean> = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
    )   
    
    online$.subscribe((online: boolean) => {
        console.log(`You ${online ? 'are' : 'are not'} connected to the internet!`);
    })
}