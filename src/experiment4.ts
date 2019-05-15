import {Subject} from 'rxjs';
abstract class Gun{
  private range: number
  private accuracyRating: number
  private decibelsWhenFired: number
  private fireRate: number
  private bulletsInChamber: number
  private isAutomatic: boolean
  private triggerBeingHeldSubject: Subject<boolean> = new Subject()
  private firingInterval: NodeJS.Timeout

  constructor(){
    this.triggerBeingHeldSubject.subscribe(
      triggerBeingHeld => {
        if(triggerBeingHeld){
          if(this.isAutomatic){
            this.firingInterval = setInterval(() => {
              this.fireBullet()
            }, this.fireRate)
          }
          else{
            this.fireBullet()
          }
        }
        else{
          clearInterval(this.firingInterval)
        }
      }
    )
  }

  private fireBullet(): Promise<any>{
    if(this.bulletsInChamber > 0){
      this.bulletsInChamber -= 1
      return Promise.resolve()
    }
    else{
      return Promise.reject('no bullets in chamber')
    }
  }

  pullTrigger(){
    return new Promise((resolve, reject) => {
      
    });
    
  }

  private releaseTrigger(){
  }


  reload(){
    
  }
}

abstract class AutomaticGun extends Gun{

}

class Pistol extends Gun{
  magazineSize
  accuracyRating
  constructor(){
    super()
    this.magazineSize = 6
  }

}

class MachineGun extends AutomaticGun{

}

class SniperRifle extends Gun{

}

abstract class GunDecorator extends Gun{

}

class Scope extends GunDecorator{

}

class LaserSight extends GunDecorator{

}

class Silencer extends GunDecorator{

}

class EnhancedMagazine extends GunDecorator{

}