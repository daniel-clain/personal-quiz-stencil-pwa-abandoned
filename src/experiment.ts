
class Wheel{
  spin(){}
}

class Brakes{
  use(){}
}

class HandleBars{
  constructor(brakes?: Brakes) {}
  turn(){}
}

class Peddles{
  peddle(){}
}

class Bike{
  constructor(
    private handlebars: HandleBars,
    private wheels: Wheel[],
    private peddles: Peddles
    ) {
    super()
  }
}

const bob = new Person('Bob')

const someBike = new Bike(
  new HandleBars(),
  [
    new Wheel(),
    new Wheel()
  ],
  new Peddles()
)

const passangerBob = bob as Passenger
passangerBob.getInVehicle(someBike)
someBike.move()

