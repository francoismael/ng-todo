/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { ChipsComponent } from '../chips/chips.component';
import { ValidationErrorComponent } from '../validation-error/validation-error.component';

@Component({
    selector: 'app-dropdown-chips',
    imports: [
        ChipsComponent,
        ReactiveFormsModule,
        CommonModule,
        NgSelectComponent,
        NgOptionComponent,
        ChipsComponent,
        ValidationErrorComponent,
    ],
    templateUrl: './dropdown-chips.component.html',
    styleUrls: ['./dropdown-chips.component.scss'],
})
export class DropdownChipsComponent<T = any> {
    @Input() selectedItems: T[] = [];
    @Input() suggestions: T[] = [];
    @Input() isLoading = false;
    @Input() label = 'Éléments sélectionnés';
    @Input() formGroup!: FormGroup;
    @Input() formControlName!: string;

    @Input() getItemId: (item: T) => string | number = (item) => (item as any).id;
    @Input() getItemName: (item: T) => string = (item) => (item as any).name;

    @Output() removeItem = new EventEmitter<T>();

    onRemove(item: T) {
        this.removeItem.emit(item);
    }

    get control() {
        return this.formGroup?.get(this.formControlName);
    }
}
