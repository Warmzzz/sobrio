import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isSex } from '../core/preferences';

export function sexValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return isSex(control.value) ? null : { sex: { value: control.value } };
  };
}
