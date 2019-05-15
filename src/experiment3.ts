abstract class Unit{
  hitPoints: number
  takeDamage(damage: number){
    this.hitPoints -= damage
  }
}

abstract class MillitaryUnit extends Unit{
  attackDamage: number
  attack(unit: Unit){
    unit.takeDamage(this.attackDamage)
  }
}

abstract class MountedUnit extends MillitaryUnit{

}

abstract class PikeUnit extends MillitaryUnit{
  extraDamageDealtToMountedUnits = 2.5
  attack(unit: Unit){
    if(unit instanceof MountedUnit){
      unit.takeDamage(this.attackDamage * this.extraDamageDealtToMountedUnits)
    }
    else{
      super.attack(unit)
    }
  }
}


class CavalryArcher implements IMountedUnit, IArcheryUnit{}

class Knight extends MountedUnit{}

class Halberdier extends PikeUnit{}

const testKnight = new Knight()
const testHalberdier = new Halberdier()

testHalberdier.attack(testKnight)

/*

  - unit class doesnt include getAttacked(), not sure if good design pattern and un necessary to fulfil scenario
  - not sure if PikeUnit class correctly implements the idea of doing extra damage to mounted units, use of instance of is a guess, not sure if else statement super is correct

*/




interface TakesDamage {
  takesDamage(hits)
}

interface ModifiesLife {
  modify(life:number, hits: number): number
}

class DefaultModifesLife implements ModifiesLife {
  modify(life:number, hits: number): number {
    return life - hits;
  }
}

class DoubleModifesLife implements ModifiesLife {
  modify(life:number, hits: number): number {
    return life - (hits * 2);
  }
}

class UnitOne implements TakesDamage {
  private life;
  private modifier: ModifiesLife;

  constructor(life: number , modifier: ModifiesLife) {
    this.modifier = modifier
    this.life = life
  }

  takesDamage(hits) {
    this.life = this.modifier.modify(this.life, hits)
  }
}


class UnitTwo implements TakesDamage {
  private life;
  private modifier: ModifiesLife;

  constructor(life: number , modifier: ModifiesLife) {
    this.modifier = modifier
    this.life = life
  }

  takesDamage(hits) {
    this.life = this.modifier.modify(this.life, hits)
  }
}


class Attacker {
  private hits: number

  attack(object: TakesDamage) {
    object.takesDamage(this.hits)
  }
}


const attacker = new Attacker();
const u1 = new UnitOne(10, new DefaultModifesLife())
let u2 = new UnitTwo(10, new DefaultModifesLife())

u2 = new UnitTwo(u2.getLife(), new DoubleModifesLife())

attacker.attack(u1);



