// Repository. Proporciona métodos para interactuar con la db y realizar operaciones CRUD, lectura, creación , actualización y eliminación. 

import { type PrismaClient } from "@prisma/client";
import createDebug from 'debug';
import { type User, type UserCreateDto } from "../entities/user.js";
import { HttpError } from "../middleware/errors.middleware.js";
import { type WithLoginRepo } from "./type.repo.js";

const debug = createDebug('W9E:users:repo:sql'); 

// Objeto select, define las columnas de las tablas que se consultarán. Configuración previa que se utiliza a continuación.
const select = {
  id: true,
  name: true,
  email: true,
  role: true,
  lessons: {
    select: {
      id: true,
      title: true,
      category: true,
      description: true,
      content: true,
      user: false
    }
  }
}

// Métodos para interactuar con la db, se instancia PrismaClient. 
export class UsersSqlRepo implements WithLoginRepo<User, UserCreateDto>{
constructor(private readonly prisma: PrismaClient) {
  debug('Instantiated users sql repository');
}

// Devuelve todos los usuarios de la db utilizando el método findMany de PrismaClient.
  async readAll() {
    return this.prisma.user.findMany({select});
  }

// Devuelve un usuario seleccionado por id con findUnique de PrismaClient se le pasa un objeto con una condición, where, que permite buscar un usuario cuyo id coincida con el id que proporcionamos como parámetro. Si no se encuentra lanza un error HTTP 404, Not Found. 
  async readById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select,
    });
    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);
    }

    return user;
  }

  async searchForLogin(key: 'email' | 'name', value: string) {

    if (!['email', 'name'].includes(key)) {
      throw new HttpError(404, 'Not Found', 'Invalid query parameters');
    }

    const userData = await this.prisma.user.findFirst({
      where: {
        [key]: value,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!userData) {
      throw new HttpError(404, 'Not Found', `Invalid ${key} or password`);
    }

    return userData;
  }

  async create(data: UserCreateDto) {
  try {
    const newUser = await this.prisma.user.create({
      data: {
        ...data,
        role: 'User',
      }, select
    });
    return newUser;
  } catch (error: any){
    throw new Error(`Failed to create user: ${error.message}`)
  }
}

  async update(id: string, data: Partial<UserCreateDto>) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);

    }

    return this.prisma.user.update({
      where: { id },
      data,
      select,
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {id},

    });
    if(!user) {
      throw new HttpError(404, 'Not Found', `User ${id} not found`);

    }

    return this.prisma.user.delete({
      where: {id},
      select,
    });
  }
}
