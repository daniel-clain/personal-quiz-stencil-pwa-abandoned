import { User } from "firebase";
import { Observable } from "rxjs";

export interface IAuthService{
  user$: Observable<User>
  setup()
  login()
  logout()
}
