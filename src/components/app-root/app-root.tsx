import { Component, State } from '@stencil/core';
import { Views } from '../../types/views';


@Component({
  tag: 'app-root',
  shadow: true
})
export class AppRoot {
  @State() view: Views = 'Start Quiz'
  

  render() {
    console.log('doing');
    return [
      <app-nav></app-nav>,
      this.view == 'Start Quiz' ?
      <start-quiz></start-quiz> : <manage-questions></manage-questions>,
    ]
  }
}
