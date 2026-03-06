import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { back } from '../../../core/router-store/router.actions';
import { AppRouterState } from '../../../core/router-store/router.reducers';

@Component({
    selector: 'app-go-back',
    imports: [LucideAngularModule],
    templateUrl: './go-back.component.html',
    styleUrl: './go-back.component.scss',
})
export class GoBackComponent {
    private readonly routerStore = inject(Store<AppRouterState>);
    protected readonly backIcon = ArrowLeft;

    goBack() {
        this.routerStore.dispatch(back());
    }
}
