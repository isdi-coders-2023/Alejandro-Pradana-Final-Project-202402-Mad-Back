import { type User } from "./user";

export type Lesson = {
  id: string;
  title: string;
  category:  'Humanities' | 'Science' | 'Sports' | 'Art' | 'Technology' | 'Social_Science';
  description: string;
  content: string;
  user: Partial<User>
}

export type LessonCreateDto = {
  title: string;
  userId: string;
  content: string;
  category:  'Humanities' | 'Science' | 'Sports' | 'Art' | 'Technology' | 'Social_Science';
  description: string;
}
