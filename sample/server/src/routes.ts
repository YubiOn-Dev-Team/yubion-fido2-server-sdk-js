import { Router } from 'express';
import { FssController } from './controllers/fssController';

const router = Router();
const fssController = new FssController();

// User Registration
router.post('/register/start', (req, res) => fssController.startRegistration(req, res));
router.post('/register/finish', (req, res) => fssController.finishRegistration(req, res));

// User Authentication (Login)
router.post('/login/start', (req, res) => fssController.startLogin(req, res));
router.post('/login/finish', (req, res) => fssController.finishLogin(req, res));

// User and Credential Management
router.get('/users', (req, res) => fssController.getUsers(req, res));
router.get('/users/:userId', (req, res) => fssController.getUser(req, res));
router.post('/users/:userId/credentials/start', (req, res) => fssController.startAddCredential(req, res));
router.post('/users/:userId/credentials/finish', (req, res) => fssController.finishAddCredential(req, res));
router.delete('/users/:userId/credentials/:credentialId', (req, res) => fssController.deleteCredential(req, res));

// Session Management
router.get('/session', (req, res) => fssController.checkSession(req, res));
router.post('/logout', (req, res) => fssController.logout(req, res));

export { router };
