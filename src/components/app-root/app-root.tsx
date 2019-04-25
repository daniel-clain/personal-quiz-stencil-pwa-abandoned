import { Component, State, Listen } from '@stencil/core';
import { Views } from '../../types/views';


@Component({tag: 'app-root'})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  @Listen('viewSelected') 
  onViewSelected(event: CustomEvent){
    this.view = event.detail
  }
  

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
