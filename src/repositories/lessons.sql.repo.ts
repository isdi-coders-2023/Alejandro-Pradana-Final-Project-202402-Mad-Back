import { type PrismaClient } from "@prisma/client";
import createDebug from 'debug';
import { type Lesson, type LessonCreateDto } from "../entities/lesson";
import { type Repo } from "./type.repo";
import { HttpError } from "../middleware/errors.middleware";

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
      name: true,
      email: true,
      role: true,
    },
  },
};

export class LessonsSqlRepo implements Repo<Lesson, LessonCreateDto> {
  constructor(private readonly prisma: PrismaClient) {
    debug('Instatiated classes sql repository')
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
      throw new HttpError(404, 'Not Found', `Class ${id} not found`)
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
      throw new HttpError(404, 'Not Found', `Lesson ${id} Not Foound`);
    }

    return this.prisma.lesson.delete({
      where: { id },
      select,
    })
  }
}
