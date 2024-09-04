import { findUserByMac, createUser } from '../models/userModel.js';

export async function userIdentificationMiddleware(req, res, next) {
    const { mac_id } = req.query.mac_id ? req.query : req.body;
    const db = req.app.get('db');
  
    if (!mac_id) {
        return res.status(400).json({ error: 'MAC ID is required' });
    }

    try {
        let user = await findUserByMac(db, mac_id);
        
        if (!user) {
            user = await createUser(db, {
                mac_id,
                ip: req.ip,
                location: req.headers['x-location'] || 'Unknown', 
                device_name: req.headers['x-device-name'] || 'Unknown Device', 
                username: req.headers['x-username'] || 'akash',
            });
            user = user.ops[0]; // The newly created user
        }

        req.user = user;  // Attach user to request
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}
