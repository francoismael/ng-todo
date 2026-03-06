/* eslint-disable dot-notation */
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ModuleService } from '../../../authentication/service/module.service';
import { Menu } from '../../types/menu.interface';
import { HeaderComponent } from '../header/header.component';
import { MenuComponent } from '../menu/menu.component';

@Component({
    selector: 'app-module-root',
    imports: [CommonModule, RouterModule, MenuComponent, HeaderComponent, RouterModule],
    templateUrl: './module-root.component.html',
    styleUrl: './module-root.component.scss',
})
export class ModuleRootComponent {
    private route = inject(ActivatedRoute);
    private moduleService = inject(ModuleService);

    menus = input.required<Menu[]>();
    router = inject(Router);

    ngOnInit() {
        const moduleName = this.route.snapshot.data['moduleName'];
        if (moduleName) {
            this.moduleService.setModuleName(moduleName);
        }
    }
}
