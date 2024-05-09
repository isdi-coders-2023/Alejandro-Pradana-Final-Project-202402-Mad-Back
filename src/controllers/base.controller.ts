// Incluirá los validadores de Joi dentro de una superclase que heredará en userscontroller, 
import createDebug from 'debug';
import { type NextFunction, type Request, type Response } from 'express';
import { type Repo } from "../repositories/type.repo";
import type Joi from 'joi';

const debug = createDebug('W9E:base:controller');
// Clase abstracta BaseController que será heredada por otros controladores en la aplicación. El tipado genérico T representa el tipo de objeto manejado por el controller y otro tipo generico C que representa el tipo de datos utilizados para crear nuevos objetos 
export abstract class BaseController<T, C> {
  // Esta tiene un constructor que recibe instancia repo que implementa la interfaz Repo la cual define los métodos genéricos readAll, readById, create, update y delete
  constructor ( protected readonly repo: Repo<T, C>,
    protected readonly validateCreateDtoSchema: Joi.ObjectSchema<C>,
    protected readonly validateUpdateDtoSchema: Joi.ObjectSchema<C>
  ) {

  }

  // Maneja  solicitudes para obtener todos los objetos de tipo T. Llama readAll a traves del repo devolviendolos en formato JSON. 
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.repo.readAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Maneja solicitudes para obtener un objeto concreto a través de su id. Llama a readById
  async getById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
    const result = await this.repo.readById(id);
    res.json(result)
    } catch (error) {
      next(error);
    }
  }

  // Maneja req para crear un objeto del tipo C, obtiene los datos del cuerpo de la solicitud. 
  async create(req: Request, res: Response, next: NextFunction ) {
    const data = req.body as C;


    try {
      const result = await this.repo.create(data);
      res.status(201);
      res.json(result);
    } catch (error) {
      next(error)}
  }

  // Extrae el id de los parametros de la solicitud. Obtiene los datos que se introducen actualizados del cuerpo de la solicitud. Se utiliza el método update desde el repo y se pasan los datos actualizados junto con el id. 
  async update(req: Request, res: Response, next: NextFunction ) {
    const { id } = req.params;
    const data = req.body as C;

    try {
      const result = await this.repo.update(id, data);
      res.json(result);
    } catch (error) {
      next(error)}
  }

  async delete(req: Request, res: Response, next: NextFunction ) {
    const { id } = req.params;

    try {
      const result = await this.repo.delete(id);
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

}


// Incluir type.repo con tipos e interfaces Repo <T, C> que representarán el tipo de objetos que se almacenan en el repositorio y el tipo de datos que se utilizan para crear nuevos objetos
// WithLoginRepo<T, C> extension de Repo, añadir a searchForLogin
// Con esta capa se añade para extender la funcionalidad del repo
