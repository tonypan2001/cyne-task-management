import { Task } from './task'

export interface WeeklyCalendarProps {
    tasks: Task[]
    referenceDate: Date
    onDateChange: (date: Date) => void
}