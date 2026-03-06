export interface TaskItem {
  id?: number;
  title: string;
  description?: string;
  groupId?: number | null;
  locationId?: number | null;
  dueDate?: number | null;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number | null;
}
