import { Router } from 'express';
import { GoogleMapsService } from '../services/google-maps.service';

export const googleMapsRoutes = Router();
const googleMapsService = new GoogleMapsService();

// GET /api/public/google-maps/geocode?address=<endereço>
// GET /api/public/google-maps/geocode?address=<lat,lng>&latlng=true  (reverse geocoding)
googleMapsRoutes.get('/geocode', async (req, res) => {
    try {
        const { address, latlng } = req.query;

        if (!address) {
            return res.status(400).json({
                status: 'error',
                message: 'Address parameter is required'
            });
        }

        let data: any;

        if (latlng === 'true') {
            // Reverse geocoding: address contém "lat,lng"
            data = await googleMapsService.reverseGeocode(address as string);
        } else {
            // Forward geocoding: address contém o endereço em texto
            data = await googleMapsService.geocode(address as string);
        }

        return res.json(data);
    } catch (error: any) {
        console.error('[GOOGLE_MAPS_ROUTES] Geocode error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
});
