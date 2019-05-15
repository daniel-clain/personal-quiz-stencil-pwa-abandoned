class Fighter{
  private _hitPoints: number
  constructor(private name: string){
    this._hitPoints = 5
  }
  attack(enemeyFighter: Fighter){
    console.log(`${this.name} attacked ${enemeyFighter.name}`)
    enemeyFighter.getAttacked(this)

  }
  getAttacked(attackingFighter: Fighter){
    console.log(`${this.name} was attacked by ${attackingFighter.name}`)
    this._hitPoints -= 1
  }
  get hitPoints(): number {
    return this._hitPoints
  }
}

const fighterBob = new Fighter('Bob')
const fighterJim = new Fighter('Jim')

fighterBob.attack(fighterJim)

/*




*/

