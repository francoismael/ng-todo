import { Routes } from "@angular/router";
import { LoginComponent } from "./component/login/login.component";
import { RegisterComponent } from "./component/register/register.component";

export const AUTH_ROUTES: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
];
