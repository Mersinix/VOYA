import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import campaignsRouter from "./campaigns";
import adminRouter from "./admin";
import partnerRouter from "./partner";
import influencerRouter from "./influencer";
import { trackingRouter } from "./tracking";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(categoriesRouter);
router.use(campaignsRouter);
router.use(adminRouter);
router.use(partnerRouter);
router.use(influencerRouter);
router.use("/tracking", trackingRouter);

export default router;
