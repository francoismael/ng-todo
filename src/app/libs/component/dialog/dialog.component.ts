import { Component, input, signal } from '@angular/core';

@Component({
    selector: 'app-dialog',
    imports: [],
    templateUrl: './dialog.component.html',
    styleUrl: './dialog.component.scss',
})
export class DialogComponent {
    message = input.required<string>();
    isSuccess = input<boolean>(false);

    isOpen = signal<boolean>(false);
    onOpenDialogue = input.required<boolean>();

    open() {
        this.isOpen.set(!this.isOpen());
    }

    close() {
        this.isOpen.set(false);
    }
}
