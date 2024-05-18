import createDebug from 'debug';
import { type LessonCreateDto, type Lesson } from "../entities/lesson.js";
import { BaseController } from "./base.controller.js";
import { type WithSearchCategory, type Repo } from '../repositories/type.repo.js';
import { lessonCreateDtoSchema, lessonUpdateDtoSchema } from '../entities/lesson.schema.js';
import { type NextFunction, type Request, type Response } from 'express';
import { type Payload } from '../services/auth.services';
import { type UserCreateDto, type User } from '../entities/user.js';
import { type Category } from '@prisma/client';

const debug = createDebug('W9E:lessons:controller');

export class LessonsController extends BaseController<Lesson, LessonCreateDto> {

  constructor(
    protected readonly repo: WithSearchCategory<Lesson, LessonCreateDto>,
    protected readonly userRepo: Repo<User, UserCreateDto> // Esto que
  ) {
    super(repo, lessonCreateDtoSchema, lessonUpdateDtoSchema);

    debug('Instatiated lessons controller');
  }

  async create(req: Request, res: Response, next:NextFunction) {
    debug('Creating lesson');
    // Const userRole = req.userRepo.readById;
    req.body.userId = (req.body.payload as Payload).id;

    const { payload, ...rest } = req.body as LessonCreateDto & {
      payload: Payload;
    };
    req.body = rest;

    await super.create(req, res, next);
  }

  async getByCategory(req: Request, res: Response, next:NextFunction){
    let { category } = req.params;
    category = category.charAt(0).toUpperCase() + category.slice(1);
    try {
    const result = await this.repo.readByCategory(category as Category);
    res.json(result)
    } catch (error) {
      next(error);
    }
  }
}
