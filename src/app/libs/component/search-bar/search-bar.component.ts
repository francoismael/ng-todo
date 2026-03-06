import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';
import { debounceTime } from 'rxjs';

export interface SearchForm {
    search: FormControl<string>;
}
@Component({
    selector: 'app-search-bar',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
    templateUrl: './search-bar.component.html',
    styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements AfterViewInit {
    private readonly formBuilder = inject(FormBuilder);
    protected readonly Search = Search;
    placeholder = input<string>('Rechercher...');

    @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

    initForm(): FormGroup<SearchForm> {
        return this.formBuilder.nonNullable.group({
            search: [''],
        });
    }

    searchForm = this.initForm();

    isFocused = signal<boolean>(true);

    searchChange = output<string>();

    constructor() {
        this.searchForm.controls.search.valueChanges.pipe(debounceTime(400)).subscribe((value) => {
            this.searchChange.emit(value?.trim() || '');
        });
    }

    ngAfterViewInit(): void {
        this.searchInput.nativeElement.focus();
    }
}
