import { Router } from "express";
import validateSchema from "../Middlewares/validateSchema.js";
import { AddCostumerSchema } from "../Schemas/costumerSchema.js";
import { postCusto, getCustos, getCustoId, putCusto } from "../Controllers/customerController.js";

const custoRouter = Router();

custoRouter.post('/customers', validateSchema(AddCostumerSchema), postCusto);
custoRouter.put('/customers/:id', validateSchema(AddCostumerSchema), putCusto);
custoRouter.get('/customers', getCustos);
custoRouter.get('/customers/:id', getCustoId);

export default custoRouter;