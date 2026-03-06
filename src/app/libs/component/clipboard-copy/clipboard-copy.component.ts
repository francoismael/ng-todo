import { Component, Input, signal } from '@angular/core';
import { Clipboard, ClipboardCheck, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-clipboard-copy',
    imports: [LucideAngularModule],
    templateUrl: './clipboard-copy.component.html',
    styleUrl: './clipboard-copy.component.scss',
})
export class ClipboardCopyComponent {
    @Input({ required: true }) textToCopy!: string;
    protected readonly Clipboard = Clipboard;
    protected readonly ClipboardCheck = ClipboardCheck;

    isCopied = signal<boolean>(false);

    copyText() {
        if (!navigator.clipboard) {
            console.warn('Clipboard API non disponible, fallback déclenché.');
            this.fallbackCopyText(this.textToCopy);
            return;
        }

        navigator.clipboard
            .writeText(this.textToCopy)
            .then(() => {
                this.isCopied.set(true);
                setTimeout(() => this.isCopied.set(false), 5000);
            })
            .catch((err) => {
                console.error('Erreur de copie', err);
            });
    }

    fallbackCopyText(text: string) {
        const textArea = document.createElement('textarea');
        textArea.value = text;

        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            console.log('Fallback copy successful: ', successful);
            this.isCopied.set(true);
            setTimeout(() => this.isCopied.set(false), 5000);
        } catch (err) {
            console.error('Fallback copy failed', err);
        }

        document.body.removeChild(textArea);
    }
}
