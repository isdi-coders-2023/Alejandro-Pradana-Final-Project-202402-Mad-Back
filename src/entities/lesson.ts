import { type User } from "./user.js";

export type Lesson = {
  id: string;
  title: string;
  category:  Category;
  description: string;
  content: string;
  user: Partial<User>
}

export type LessonCreateDto = {
  title: string;
  userId: string;
  content: string;
  category:  Category;
  description: string;
}

export type Category =  'Humanities' | 'Science' | 'Sports' | 'Art' | 'Technology' | 'Social_Science';
