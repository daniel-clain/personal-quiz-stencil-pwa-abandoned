abstract class Unit2{
  hitPoints: number
  getAttacked(attackingUnit: MillitaryUnit2){
    this.takeDamage(attackingUnit.attackDamage)
  }
  takeDamage(damage: number){
    this.hitPoints -= damage 
  }
}

abstract class MillitaryUnit2 extends Unit2{
  attackDamage: number
  attack(unit: Unit2){
    unit.getAttacked(this)
  }
}

abstract class MountedUnit2 extends MillitaryUnit2{
  extraDamageTakenFromPikeUnits = 2.5
  getAttacked(attackingUnit: MillitaryUnit2){
    if(attackingUnit instanceof PikeUnit2){
      this.takeDamage(attackingUnit.attackDamage * this.extraDamageTakenFromPikeUnits)
    }
    else{
      super.getAttacked(attackingUnit)
    }
  }
}

abstract class PikeUnit2 extends MillitaryUnit2{
  
}

class Knight2 extends MountedUnit2{}

class Halberdier2 extends PikeUnit2{}

const testKnight2 = new Knight2()
const testHalberdier2 = new Halberdier2()

testHalberdier2.attack(testKnight2)


/*

  - unit class does include getAttacked(), not sure if good design pattern, should a classes methods be about what it does or what can be done to it
  - not sure if MountedUnit class correctly implements the idea of doing taking extra damage from pike units, use of instance of is a guess, not sure if else statement super is correct

*/