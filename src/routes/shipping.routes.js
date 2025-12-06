import express from 'express';
import { 
  calculateShipping, 
  getShippingConfig,
  validateZipCode
} from '../controllers/shipping.controller.js';

const router = express.Router();

/**
 * @route   
 * @desc    
 * @access 
 */
router.post('/calculate', calculateShipping);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/config', getShippingConfig);

/**
 * @route   
 * @desc    
 * @access  
 */
router.post('/validate-zipcode', validateZipCode);

export default router;