import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

type ValidationErrorType = 'required' | 'email' | 'min' | 'max' | 'minlength' | 'maxlength' | 'invalidPhone';

const VALIDATION_ERROR_LABELS: Record<ValidationErrorType, string> = {
    required: 'Champ  requis',
    email: 'Email invalide',
    min: 'Trop petit',
    max: 'Trop grand',
    minlength: 'Trop court',
    maxlength: 'Tros long',
    invalidPhone: 'Numéro invalide',
};

@Component({
    selector: 'app-validation-error',
    templateUrl: './validation-error.component.html',
    styleUrls: ['./validation-error.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class ValidationErrorComponent {
    control = input.required<AbstractControl>();
    customErrorLabels = input<Record<string, string>>();
    errorLabels: Record<ValidationErrorType, string> = VALIDATION_ERROR_LABELS;
}
