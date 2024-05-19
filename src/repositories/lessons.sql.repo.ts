import { type PrismaClient } from "@prisma/client";
import createDebug from 'debug';
import {type Category, type Lesson, type LessonCreateDto } from "../entities/lesson.js";
import { type WithSearchCategory } from "./type.repo.js";
import { HttpError } from "../middleware/errors.middleware.js";

const debug = createDebug('W9E:lessons:repo:sql')

const select = {
  id: true,
  title: true,
  category: true,
  description: true,
  content: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
};

export class LessonsSqlRepo implements WithSearchCategory<Lesson, LessonCreateDto> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instatiated lessons sql repository')
  }
 

  async readAll() {
    const lessons = await this.prisma.lesson.findMany({
      select,
    })
    return lessons;
  }

  async readById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select,
    });


    if(!lesson) {
      throw new HttpError(404, 'Not Found', `Lesson ${id} not found`)
    }

    return lesson;
  }

  async create(data: LessonCreateDto) {
    return this.prisma.lesson.create({
      data: { 
        ...data,
      },
      select,
    })
  }

  async update(id: string, data: Partial<LessonCreateDto>){
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select,
    });
    if(!lesson) {
      throw new HttpError(404, 'Not Found', `Lesson ${id} not found`)
    }

    return this.prisma.lesson.update({
      where: { id },
      data,
      select,
    })
  }

  async delete(id: string): Promise<Lesson> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select,
    });
    if(!lesson) {
      throw new HttpError(404, 'Not Found', `Lesson ${id} Not Found`);
    }

    return this.prisma.lesson.delete({
      where: { id },
      select,
    })
  }

  async readByCategory(category: Category) {
    const lesson = await this.prisma.lesson.findMany({
      where: { category },
      select,
    });


    if(!lesson) {
      throw new HttpError(404, 'Not Found', `Lesson ${category} not found`)
    }

    return lesson;
  }
}
