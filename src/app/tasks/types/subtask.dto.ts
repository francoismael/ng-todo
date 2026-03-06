export interface SubTask {
    id: string,
    title: string,
    status: 'pending' | 'in-progress' | 'done',
}