import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { RegistrationComponent } from './registration/registration.component';
import { RequestPasswordComponent } from './request-password/request-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChooseAvatarComponent } from './choose-avatar/choose-avatar.component';

export const routes: Routes = [
    { path: '', component: ChooseAvatarComponent },
    { path: 'main', component: MainComponent },
    { path: 'imprint', component: ImprintComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'choose-avatar', component: ChooseAvatarComponent },
    { path: 'reset-password', component: RequestPasswordComponent },
    { path:'reset-password/:token', component: ResetPasswordComponent },
];
