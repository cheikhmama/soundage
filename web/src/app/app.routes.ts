import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { HomeComponent } from './features/home/home.component';
import { AdminUsersComponent } from './features/admin/users/users.component';
import { PollsListComponent } from './features/polls/polls-list/polls-list.component';
import { PollDetailComponent } from './features/polls/poll-detail/poll-detail.component';
import { AdminPollsListComponent } from './features/admin/polls/admin-polls-list.component';
import { AdminPollFormComponent } from './features/admin/polls/admin-poll-form.component';
import { PollResultsComponent } from './features/admin/polls/poll-results.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'polls' },
      { path: 'dashboard', component: HomeComponent, canActivate: [adminGuard] },
      { path: 'polls', component: PollsListComponent },
      { path: 'polls/:id', component: PollDetailComponent },
      { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
      { path: 'admin/polls', component: AdminPollsListComponent, canActivate: [adminGuard] },
      { path: 'admin/polls/new', component: AdminPollFormComponent, canActivate: [adminGuard] },
      {
        path: 'admin/polls/:id/edit',
        component: AdminPollFormComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'admin/polls/:id/results',
        component: PollResultsComponent,
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', redirectTo: 'polls' },
];
