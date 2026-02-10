import { ZodPipe, ZodObject, ZodTransform } from "zod/v4";

export type FormSchema = ZodPipe<ZodObject<any>, ZodTransform<any>> | ZodObject<any>;
