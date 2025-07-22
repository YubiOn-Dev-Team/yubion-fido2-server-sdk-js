import { Request, Response } from 'express';
// Correctly import the SDK
import { YubiOnFssSdk, Fido2StartRegisterParameter, Fido2FinishRegisterParameter, Fido2StartAuthenticateParameter, Fido2FinishAuthenticateParameter } from '@yubion-dev-team/yubion-fido2-server-sdk-js';

// Extend Express session to include user info and FSS session data
declare module 'express-session' {
	interface SessionData {
		user?: {
			id: string;
			name: string;
			displayName: string;
		};
		fssSessionData?: any; // To store session data from FSS
	}
}

export class FssController {
	private fss: YubiOnFssSdk;

	constructor() {
		// Instantiate the SDK correctly
		this.fss = new YubiOnFssSdk({
			endpoint : process.env.FSS_API_BASE_URL,
			rpId: process.env.FSS_RP_ID || '',
			apiAuthId: process.env.FSS_API_KEY_ID || '',
			secretKey: process.env.FSS_API_SECRET || '',
			apiAuthType: "NonceSignAuth"
		});
	}

	private getUserId(name: string): string {
		return Buffer.from(name, 'utf8').toString('base64url');
	}

	// ----------------------------------------------------------------
	// User Registration
	// ----------------------------------------------------------------
	async startRegistration(req: Request, res: Response) {
		try {
			const { name, displayName } = req.body;
			if (!name || !displayName) {
				return res.status(400).json({ message: 'Name and displayName are required.' });
			}

			const userId = this.getUserId(name);
			
			// Check if the user already exists
			let existingUser;
			try { existingUser = await this.fss.getUser(userId); } catch (error) {} // Ignore errors
			if (existingUser) {
				return res.status(400).json({ message: 'User already exists.' });
			}

			const request: Fido2StartRegisterParameter = {
				creationOptionsBase: {
					attestation: "direct",
					authenticatorSelection: {
						userVerification: 'required',
						residentKey: 'required'
					},
				},
				user: {
					userId: userId,
					userName: name,
					displayName: displayName,
					disabled: false,
				},
				options: {
					createUserIfNotExists: true,
					updateUserIfExists: false,
				},
			};

			const result = await this.fss.startRegisterCredential(request);

			req.session.fssSessionData = result.session;
			res.json({ creationOptions: result.creationOptions });

		} catch (error: any) {
			console.error(error);
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	async finishRegistration(req: Request, res: Response) {
		try {
			const fssSessionData = req.session.fssSessionData;
			if (!fssSessionData) {
				return res.status(400).json({ message: 'Registration session not found.' });
			}

			const request: Fido2FinishRegisterParameter = req.body;
			
			const verifyResult = await this.fss.verifyRegisterCredential(request, fssSessionData);
			if (!verifyResult.credential.userPresence || !verifyResult.credential.userVerification) {
				throw new Error("User presence or verification failed.");
			}

			const finishResult = await this.fss.finishRegisterCredential(request, fssSessionData);

			req.session.fssSessionData = undefined;
			res.json(finishResult);

		} catch (error: any) {
			console.error(error);
			req.session.fssSessionData = undefined;
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	// ----------------------------------------------------------------
	// User Authentication (Login)
	// ----------------------------------------------------------------
	async startLogin(req: Request, res: Response) {
		try {
			const request: Fido2StartAuthenticateParameter = {
				requestOptionsBase: {
					userVerification: 'required',
				}
			};
			const result = await this.fss.startAuthenticate(request);
			req.session.fssSessionData = result.session;
			res.json({ requestOptions: result.requestOptions });
		} catch (error: any)
		{
			console.error(error);
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	async finishLogin(req: Request, res: Response) {
		try {
			const fssSessionData = req.session.fssSessionData;
			if (!fssSessionData) {
				return res.status(400).json({ message: 'Login session not found.' });
			}

			const request: Fido2FinishAuthenticateParameter = req.body;

			const result = await this.fss.finishAuthenticate(request, fssSessionData);

			if (result.user) {
				req.session.user = {
					id: result.user.userId,
					name: result.user.userName || '',
					displayName: result.user.displayName || '',
				};
			}
			
			req.session.fssSessionData = undefined;
			res.json(result);

		} catch (error: any) {
			console.error(error);
			req.session.fssSessionData = undefined;
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	// ----------------------------------------------------------------
	// User and Credential Management
	// ----------------------------------------------------------------
	async getUsers(req: Request, res: Response) {
		if (!req.session.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		try {
			const users = await this.fss.getAllUsers();
			res.json(users);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	async getUser(req: Request, res: Response) {
		if (!req.session.user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}
		try {
			const { userId } = req.params;
			const user = await this.fss.getUser(userId);
			res.json(user);
		} catch (error: any) {
			console.error(error);
			res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	async startAddCredential(req: Request, res: Response) {
		if (!req.session.user) {
				return res.status(401).json({ message: 'Unauthorized' });
		}
		try {
				const { userId } = req.params;
				if (req.session.user?.id !== userId) {
						return res.status(403).json({ message: 'Forbidden' });
				}
				
				const request: Fido2StartRegisterParameter = {
					creationOptionsBase: {
						attestation: "direct",
						authenticatorSelection: {
							userVerification: 'required',
							residentKey: 'required'
						},
					},
					user: { userId: userId },
					options: { createUserIfNotExists: false, updateUserIfExists: false }
				};

				const result = await this.fss.startRegisterCredential(request);
				req.session.fssSessionData = result.session;
				res.json({ creationOptions: result.creationOptions });

		} catch (error: any) {
				console.error(error);
				res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	async finishAddCredential(req: Request, res: Response) {
			if (!req.session.user) {
					return res.status(401).json({ message: 'Unauthorized' });
			}
			try {
					const { userId } = req.params;
					if (req.session.user?.id !== userId) {
							return res.status(403).json({ message: 'Forbidden' });
					}
					const fssSessionData = req.session.fssSessionData;
					if (!fssSessionData) {
						return res.status(400).json({ message: 'Session not found.' });
					}

					const request: Fido2FinishRegisterParameter = req.body;
					const registerResult = await this.fss.finishRegisterCredential(request, fssSessionData);
					
					req.session.fssSessionData = undefined;
					res.json(registerResult.user);

			} catch (error: any) {
					console.error(error);
					req.session.fssSessionData = undefined;
					res.status(500).json({ message: error.response?.data?.error_description || error.message });
			}
	}

	async deleteCredential(req: Request, res: Response) {
		if (!req.session.user) {
				return res.status(401).json({ message: 'Unauthorized' });
		}
		try {
				const { userId, credentialId } = req.params;
				if (req.session.user?.id !== userId) {
						return res.status(403).json({ message: 'Forbidden' });
				}
				await this.fss.deleteCredential(userId, credentialId);
				res.status(204).send();
		} catch (error: any) {
				console.error(error);
				res.status(500).json({ message: error.response?.data?.error_description || error.message });
		}
	}

	// ----------------------------------------------------------------
	// Session Management
	// ----------------------------------------------------------------
	checkSession(req: Request, res: Response) {
		if (req.session.user) {
			res.json({ loggedIn: true, user: req.session.user });
		} else {
			res.json({ loggedIn: false });
		}
	}

	logout(req: Request, res: Response) {
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).json({ message: 'Could not log out.' });
			}
			res.clearCookie('connect.sid');
			res.status(200).json({ message: 'Logged out successfully.' });
		});
	}
}