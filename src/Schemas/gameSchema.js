import Joi from "joi";

export const addGameSchema = Joi.object({
    name: Joi.string().required(),
    image: Joi.string().uri({ scheme: ['http', 'https'], allowRelative: false }).required(),
    pricePerDay: Joi.number().greater(0).required(),
    stockTotal: Joi.number().greater(0).required()
});