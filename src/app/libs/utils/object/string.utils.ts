export function capitalizeUsername(username: string): string {
    if (typeof username !== 'string') {
        return '';
    }

    const trimmed = username.trim();
    if (trimmed.length === 0) {
        return '';
    }

    const firstChar = trimmed.charAt(0);
    const rest = trimmed.slice(1);

    return firstChar.toUpperCase() + rest.toLowerCase();
}
