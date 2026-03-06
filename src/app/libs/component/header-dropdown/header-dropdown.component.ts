import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LayoutGrid, LucideAngularModule, Power, SettingsIcon, User } from 'lucide-angular';
import { AuthenticationStore } from '../../../authentication/store/authentication.store';
import { go } from '../../../core/router-store/router.actions';
import { AppRouterState } from '../../../core/router-store/router.reducers';

@Component({
    selector: 'app-header-dropdown',
    imports: [LucideAngularModule],
    templateUrl: './header-dropdown.component.html',
    styleUrl: './header-dropdown.component.scss',
})
export class HeaderDropdownComponent {
    private readonly authenticationStore = inject(AuthenticationStore);
    private readonly routerStore = inject(Store<AppRouterState>);

    showUserMenu = false;
    protected readonly settingsIcon = SettingsIcon;
    protected readonly usersIcon = User;
    protected readonly disconnectionIcon = Power;
    protected readonly gridIcon = LayoutGrid;

    navigateToProfile(): void {
        this.showUserMenu = false;
    }

    navigateToSettings(): void {
        this.showUserMenu = false;
    }

    navigateToSelectedModule(): void {
        this.routerStore.dispatch(
            go({
                path: ['/authentication', 'module-selection'],
                extras: { replaceUrl: true },
            })
        );
    }

    logout(): void {
        this.authenticationStore.clearStorage();
        this.routerStore.dispatch(
            go({
                path: ['/authentication'],
                extras: { replaceUrl: true },
            })
        );
        location.reload();
    }
}
