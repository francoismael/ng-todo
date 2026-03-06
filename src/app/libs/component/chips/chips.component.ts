import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-chips',
    templateUrl: './chips.component.html',
    styleUrls: ['./chips.component.scss'],
    host: {
        '[attr.aria-label]': 'label + (count ? " (" + count + " éléments)" : "")',
    },
})
export class ChipsComponent {
    @Input() label?: string;
    @Input() count: number | null = null;
    @Input() clearable = false;
    @Output() delete = new EventEmitter<void>();

    expanded = true;

    onDelete(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.delete.emit();
    }

    toggleExpanded() {
        this.expanded = !this.expanded;
    }
}
