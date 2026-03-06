import { CommonModule } from '@angular/common';
import { Component, computed, effect, HostBinding, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Menu } from '../../types/menu.interface';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    imports: [RouterModule, CommonModule, LucideAngularModule],
    standalone: true,
})
export class MenuComponent {
    menus = input<Menu[]>([]);
    currentUrl = input<string>();
    helpMenu = computed(() => this.menus().find((menu) => menu.label === 'Aide'));

    closed = false;

    @HostBinding('class') hostClass = 'sidebar';

    constructor() {
        effect(() => {
            const url = this.currentUrl();
            const menus = this.menus();
            if (url) {
                this.setMenusActiveStatus(url, menus);
                this.updateSidebarclass(url);
            }
        });
    }

    private setMenusActiveStatus(url: string, menus: Menu[]) {
        menus.forEach((m) => (m.isActive = url.includes(m.routerLink)));
    }

    private updateSidebarclass(url: string) {
        if (url.startsWith('/laboratory')) {
            this.hostClass = 'laboratory-sidebar';
        } else {
            this.hostClass = 'sidebar';
        }
    }

    toggleMenu() {
        this.closed = !this.closed;
    }
}
