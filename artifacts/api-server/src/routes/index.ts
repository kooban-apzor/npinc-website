import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import siteSettingsRouter from "./site-settings";
import servicesRouter from "./services";
import peopleRouter from "./people";
import articlesRouter from "./articles";
import eventsRouter from "./events";
import awardsRouter from "./awards";
import vacanciesRouter from "./vacancies";
import cvSubmissionsRouter from "./cv-submissions";
import documentsRouter from "./documents";
import calculatorRatesRouter from "./calculator-rates";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(siteSettingsRouter);
router.use(servicesRouter);
router.use(peopleRouter);
router.use(articlesRouter);
router.use(eventsRouter);
router.use(awardsRouter);
router.use(vacanciesRouter);
router.use(cvSubmissionsRouter);
router.use(documentsRouter);
router.use(calculatorRatesRouter);
router.use(contactRouter);

export default router;
