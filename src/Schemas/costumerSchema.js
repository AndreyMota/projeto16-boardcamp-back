import Joi from "joi";

export const AddCostumerSchema = Joi.object({
    cpf: Joi.string().pattern(/^[0-9]{11}$/).required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
    name: Joi.string().required().min(1),
    birthday: Joi.date().iso().required(),
  });