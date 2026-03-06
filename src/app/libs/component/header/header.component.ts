import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { ModuleService } from '../../../authentication/service/module.service';
import { AuthenticationStore } from '../../../authentication/store/authentication.store';
import { RoleDto } from '../../../authentication/type/role.dto';
import { capitalizeUsername } from '../../utils/object/string.utils';
import { getInitial } from '../../utils/query-parser/query-parser.utils';
import { HeaderDropdownComponent } from '../header-dropdown/header-dropdown.component';

@Component({
    selector: 'app-header',
    imports: [CommonModule, HeaderDropdownComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: true,
})
export class HeaderComponent implements OnInit {
    private moduleService = inject(ModuleService);
    private authStore = inject(AuthenticationStore);
    protected readonly getInitial = getInitial;

    showUserMenu = false;

    currentUserDetails: { username: string; role: RoleDto } | null = null;
    moduleName = '';

    ngOnInit(): void {
        const loggedUser = this.authStore.loggedUser();
        this.currentUserDetails = { username: loggedUser.username, role: loggedUser.roles[0] };
        this.moduleService.moduleName$.subscribe((name) => {
            this.moduleName = name;
        });
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.user-info') && !target.closest('.user-menu')) {
            this.showUserMenu = false;
        }
    }

    toggleUserMenu(): void {
        this.showUserMenu = !this.showUserMenu;
    }

    capitalize = capitalizeUsername;
}
