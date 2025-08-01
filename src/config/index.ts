import dotenv from 'dotenv';
import { validateEnv } from './environment';

dotenv.config();

export const config = validateEnv(process.env);