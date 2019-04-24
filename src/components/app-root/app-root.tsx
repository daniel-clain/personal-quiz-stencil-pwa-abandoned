import { Component, State } from '@stencil/core';
import { Views } from '../../types/views';


@Component({
  tag: 'app-root',
  shadow: true
})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  

  render() {
    return [
      <header>
        <nav-component></nav-component>
      </header>,
      <main>
        {[
          this.view == 'Start Quiz' &&
          <quiz-component></quiz-component>,
          this.view == 'Manage Questions' &&
          <questions-component></questions-component>
        ]}
      </main>
    ]
  }
}
