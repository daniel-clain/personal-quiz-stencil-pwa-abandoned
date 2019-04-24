import { Component } from '@stencil/core';


@Component({
  tag: 'nav-component',
  styleUrl: '../../global/button.scss',
  shadow: true
})
export class NavComponent {
  

  render() {
    return (
      <nav>
        <button>Start Quiz</button>
        <button>Add Question</button>
        <button>Logout</button>
      </nav>
    )

  }
}
