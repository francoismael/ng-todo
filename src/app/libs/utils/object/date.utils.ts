export function formatDateToFrench(rawDate: string | Date | null | undefined): string {
    if (!rawDate) {
        return 'Date invalide';
    }

    const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(date.getTime())) {
        return 'Date invalide';
    }
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
}

export const formateDateToTable = (dateString: string | Date) => {
    const date = new Date(dateString);

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const time = `${hours}:${minutes}`;

    if (isToday) {
        return `Aujourd'hui à ${time}`;
    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year} à ${time}`;
    }
};
