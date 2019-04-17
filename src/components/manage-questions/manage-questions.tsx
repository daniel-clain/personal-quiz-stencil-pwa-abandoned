import { Component } from '@stencil/core';

@Component({
  tag: 'manage-questions',
  styleUrl: 'manage-questions.scss',
  shadow: true
})
export class ManageQuestions {

  render() {
    return (
      <p>
        Welcome to the Stencil App Starter.
        You can use this starter to build entire apps all with
        web components using Stencil!
        Check out our docs on <a href='https://stenciljs.com'>stenciljs.com</a> to get started.
      </p>
    );
  }
}
