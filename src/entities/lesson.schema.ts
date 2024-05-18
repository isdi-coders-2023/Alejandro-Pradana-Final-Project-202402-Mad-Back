import Joi from "joi";
import { type LessonCreateDto } from "./lesson";

export const lessonCreateDtoSchema = Joi.object<LessonCreateDto>({
  title: Joi.string().required(),
  userId: Joi.string().required(),
  description: Joi.string().default(''),
  content: Joi.string().required(),
  category: Joi.valid('Humanities', 'Science', 'Sports', 'Art', 'Technology', 'Social_Science').required(),
});

export const lessonUpdateDtoSchema = Joi.object<LessonCreateDto>({
  title:Joi.string(),
  userId: Joi.string(),
  description: Joi.string(),
  content: Joi.string(),
  category: Joi.string().valid('Humanities', 'Science', 'Sports', 'Art', 'Technology', 'Social_Science'),
})
