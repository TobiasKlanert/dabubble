import { Routes } from '@angular/router';

import { MainComponent } from './main/main.component';

import { PrivacyPolicyComponent } from './legal/privacy-policy/privacy-policy.component';
import { RegistrationComponent } from './login/registration/registration.component';
import { RequestPasswordComponent } from './login/request-password/request-password.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ChooseAvatarComponent } from './login/choose-avatar/choose-avatar.component';
import { LoginComponent } from './login/login/login.component';
import { ImprintComponent } from './legal/imprint/imprint.component';


import { EmailVerifiedComponent } from './login/email-verified/email-verified.component';
import { VerifyRequiredComponent } from './login/verified-required/verified-required.component';
import { EmailVerifiedGuard } from './shared/services/email-verified.guard';


export const routes: Routes = [
    { path: '', component: LoginComponent  },
    { path: 'main', component: MainComponent },
    { path: 'imprint', component: ImprintComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'choose-avatar', component: ChooseAvatarComponent },
    { path: 'reset-password', component: RequestPasswordComponent },
    { path:'reset-password/:token', component: ResetPasswordComponent },


     // ✅ neue Routen für E-Mail-Flow
    { path: 'email-verified', component: EmailVerifiedComponent },
    { path: 'verify-required', component: VerifyRequiredComponent },

    // ✅ Main nur für verifizierte User freigeben
    { path: 'main', component: MainComponent, canActivate: [EmailVerifiedGuard] },
];
