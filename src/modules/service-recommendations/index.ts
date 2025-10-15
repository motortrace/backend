import router from './service-recommendations.routes';
import { ServiceRecommendationsService } from './service-recommendations.service';

export { ServiceRecommendationsService } from './service-recommendations.service';
export { ServiceRecommendationsController } from './service-recommendations.controller';
export { router as serviceRecommendationsRouter };

export default {
  ServiceRecommendationsService,
  router
};