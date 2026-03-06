import { SubTask } from "./subtask.dto";

export type TaskPriority = 'low' | 'normal' | 'urgent';

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    status: 'pending' | 'in-progress' | 'done';
    priority?: TaskPriority;
    subTasks: SubTask[];
}
