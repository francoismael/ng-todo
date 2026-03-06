import { FormGroup } from '@angular/forms';

export const markFormAsTouchedAndDirty = (form: FormGroup) =>
    Object.keys(form.controls).forEach((key) => {
        const currentControl = form.controls[key] as FormGroup;
        if (currentControl.controls) {
            markFormAsTouchedAndDirty(currentControl);
        }
        currentControl.markAsDirty();
        currentControl.markAsTouched();
    });
