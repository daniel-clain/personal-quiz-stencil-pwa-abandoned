import { Component } from '@stencil/core';


@Component({
  tag: 'app-nav',
  styleUrl: '../../global/button.scss',
  shadow: true
})
export class AppNav {
  

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
