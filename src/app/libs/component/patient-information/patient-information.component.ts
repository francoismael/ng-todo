import { CommonModule } from '@angular/common';
import { Component, input, OnInit, signal } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';
import { BasicInformationAboutPatientWithMedicalInformation } from '../../../dispatcher/types/patient.interface';
import { formatDateToFrench } from '../../utils/object/date.utils';
import { ClipboardCopyComponent } from '../clipboard-copy/clipboard-copy.component';
import { LoaderComponent } from '../loader/loader.component';

@Component({
    selector: 'app-patient-information',
    imports: [LucideAngularModule, CommonModule, LoaderComponent, ClipboardCopyComponent],
    templateUrl: './patient-information.component.html',
    styleUrl: './patient-information.component.scss',
})
export class PatientInformationComponent implements OnInit {
    userBasicInfo = input<BasicInformationAboutPatientWithMedicalInformation | null>();
    isLoading = input<boolean>(true);
    hasMedicalInfo = input<boolean>(false);
    fullName = signal<string>('');

    ngOnInit(): void {
        const fullName = this.userBasicInfo()?.fullName;
        if (fullName) {
            this.fullName.set(fullName);
        }
    }

    protected readonly User = User;

    isValidDate(date: string | Date | undefined | null): boolean {
        if (!date) {
            return false;
        }
        const parsedDate = date instanceof Date ? date : new Date(date);
        return !isNaN(parsedDate.getTime());
    }

    formatDate = formatDateToFrench;
}
