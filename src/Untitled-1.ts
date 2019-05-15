


interface Adds {
  add(amount: number)
}


class AddsOne implements Adds {
  private decorate;
  
  constructor(decorate: Adds) { 
    this.decorate = decorate
  }

  add(amount: number) {
    return this.decorate.add(amount) + 1;
  }
}


class AddsTwo implements Adds {
  private decorate;
  
  constructor(decorate: Adds) { 
    this.decorate = decorate
  }

  add(amount: number) {
    return this.decorate.add(amount) + 2;
  }
}


class AddsNothing implements Adds {
  add(amount) {
    return amount;
  }
}


const add3 = new AddsOne(new AddsTwo(new AddsNothing()))

add3.add(4) //



