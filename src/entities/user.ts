import { type Lesson } from "./lesson";

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'User' | 'Admin';
  lessons: Lesson[];
}



export type UserCreateDto = {
  name: string;
  email: string;
  password: string;

}
