/* eslint-disable @typescript-eslint/no-namespace */
import { AbstractControl, ValidationErrors } from '@angular/forms';

export const MALAGASY_PHONE_REGEX = /^((034)|(033)|(032)|(039)|(038)|(020)|(\+261?((33)|(32)|(34)|(39)|(38)|(20))))[0-9]{7,7}$/;

export const UNIVERSAL_PHONE_REGEX =
    // eslint-disable-next-line max-len
    /\s*(?:\+?(\d{1,3}))?[\W\D\s]^|()*(\d[\W\D\s]*?\d[\D\W\s]*?\d)[\W\D\s]*(\d[\W\D\s]*?\d[\D\W\s]*?\d)[\W\D\s]*(\d[\W\D\s]*?\d[\D\W\s]*?\d[\W\D\s]*?\d)(?: *x(\d+))?\s*$/;

export namespace PhoneValidatorUtils {
    const genericPhoneValidator =
        (regexp: RegExp): ((arg0: AbstractControl) => ValidationErrors | null) =>
        (control: AbstractControl) =>
            control.value ? (regexp.test(control.value) ? null : { invalidPhone: true }) : null;

    export const malagasyPhoneValidator = genericPhoneValidator(MALAGASY_PHONE_REGEX);
    export const universalPhoneValidator = genericPhoneValidator(UNIVERSAL_PHONE_REGEX);
}
