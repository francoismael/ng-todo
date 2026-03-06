import { LucideIconData } from 'lucide-angular';

export interface Menu {
    label: string;
    routerLink: string;
    permission: string;
    icon: string;
    lucideIcon: LucideIconData;
    iconActive: string;
    isActive?: boolean;
}
