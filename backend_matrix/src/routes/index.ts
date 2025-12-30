import { Router } from "express";
import { healthRouter } from "./health.routes";
import { checkoutRouter } from "./checkout.routes";
import { courseRouter } from "./course.routes";
import { progressRouter } from "./progress.routes";
import { authRouter } from "./auth.routes";
import { userRouter } from "./user.routes";
import { lessonRouter } from "./lesson.routes";
import { purchaseRouter } from "./purchase.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(userRouter);
apiRouter.use(checkoutRouter);
apiRouter.use(courseRouter);
apiRouter.use(progressRouter);
apiRouter.use(lessonRouter);
apiRouter.use(purchaseRouter); // Direct purchase endpoint (mock/testing)


