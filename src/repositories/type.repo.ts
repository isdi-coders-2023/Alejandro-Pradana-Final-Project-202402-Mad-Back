// Interfaz genérica Repo que define las operaciones básicas que realizará el repo. T es el tipo de objeto genérico que almacena el repositorio y C es el tipo que representa los datos utilizados para crear nuevos objetos. 

import { type Category } from "../entities/lesson";

export type Repo<T, C> = {
  readAll(): Promise<T[]>;
  readById(id: string): Promise<T>;
  create(data: C): Promise<T>;
  update(id: string, data: Partial<C>): Promise<T>;
  delete(id: string): Promise<T>;
};

// Aquí se agrega una operación específica para la autentificación de usuarios. Ademas de Repo añade search  
export type WithLoginRepo<T, C> = Repo<T, C> & {
  searchForLogin(key: 'email' , value: string): Promise<Partial<T>>;
};

export type WithSearchCategory<T, C> = Repo<T, C> & {
  readByCategory(category: Category): Promise<T[]>;
};
