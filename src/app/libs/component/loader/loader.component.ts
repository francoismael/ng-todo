import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    imports: [CommonModule],
})
export class LoaderComponent {
    @Input('width') spinnerWidth = 50;
    @Input('height') spinnerHeight = 50;
    @Input() isLoading = true;
    @Input() fullWidth = false;
    @Input() message: string;
}
