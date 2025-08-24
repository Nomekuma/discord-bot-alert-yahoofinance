import { Router } from "express";
import { alertController } from "../controller/alertController.js";

const router = Router();

router.get("/", alertController);

export default router;
