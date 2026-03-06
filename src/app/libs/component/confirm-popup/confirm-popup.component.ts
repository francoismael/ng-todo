import { Component, inject, Input, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { CheckCircle2, LucideAngularModule, TriangleAlert } from 'lucide-angular';
import { go } from '../../../core/router-store/router.actions';
import { AppRouterState } from '../../../core/router-store/router.reducers';

@Component({
    selector: 'app-confirm-popup',
    imports: [LucideAngularModule],
    templateUrl: './confirm-popup.component.html',
    styleUrl: './confirm-popup.component.scss',
})
export class ConfirmPopupComponent {
    @Input({ required: true }) message = 'Confirm?';
    @Input({ required: true }) visible = signal(false);
    @Input({ required: false }) isError = false;
    @Input({ required: false }) isRedirected = true;
    @Input() redirectPath: string[] | null = null;
    protected iconCheck = CheckCircle2;
    protected iconAlert = TriangleAlert;
    private readonly routerStore = inject(Store<AppRouterState>);
    close() {
        this.visible.set(false);
        if (this.isRedirected && this.redirectPath && this.redirectPath.length > 0) {
            this.routerStore.dispatch(go({ path: this.redirectPath }));
        }
    }
}
