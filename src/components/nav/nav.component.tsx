import { Component, State, Event, EventEmitter, Prop } from '@stencil/core';
import { AuthService } from '../../classes/auth-service/auth.service';
import { User } from 'firebase';
import { Views } from '../../global/types/views';


@Component({tag: 'nav-component'})
export class NavComponent {
  @Prop() authService: AuthService
  @State() connected: boolean
  @Event() viewSelected: EventEmitter<Views>

  componentWillLoad(){
    this.authService.user$.subscribe((user: User) => this.connected = !!user)
  }
  

  render() {
    return (
      <nav>
        <button id='start-quiz' onClick={() => this.viewSelected.emit('Start Quiz')}>Start Quiz</button>
        <button id='add-question' onClick={() => this.viewSelected.emit('Manage Questions')}>Add Question</button>
        {!this.connected && 
          <button id='login' onClick={() => this.authService.login()}>Login</button>}
        {this.connected && 
          <button id='logout' onClick={() => this.authService.logout()}>Logout</button>}
      </nav>
    )

  }
}
