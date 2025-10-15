import router from './mileage-tracking.routes';
import { MileageTrackingService } from './mileage-tracking.service';

export { MileageTrackingService } from './mileage-tracking.service';
export { MileageTrackingController } from './mileage-tracking.controller';
export { router as mileageTrackingRouter };

export default {
  MileageTrackingService,
  router
};