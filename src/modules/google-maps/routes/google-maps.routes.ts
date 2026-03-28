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

// GET /api/public/google-maps/autocomplete?input=<texto>
googleMapsRoutes.get('/autocomplete', async (req, res) => {
    try {
        const { input } = req.query;

        if (!input) {
            return res.status(400).json({
                status: 'error',
                message: 'Input parameter is required'
            });
        }

        const data = await googleMapsService.autocomplete(input as string);
        return res.json(data);
    } catch (error: any) {
        console.error('[GOOGLE_MAPS_ROUTES] Autocomplete error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
});

// GET /api/public/google-maps/place-details?placeId=<id>&fields=<campos>
googleMapsRoutes.get('/place-details', async (req, res) => {
    try {
        const { placeId, fields } = req.query;

        if (!placeId) {
            return res.status(400).json({
                status: 'error',
                message: 'placeId parameter is required'
            });
        }

        const data = await googleMapsService.getPlaceDetails(placeId as string, fields as string);
        return res.json(data);
    } catch (error: any) {
        console.error('[GOOGLE_MAPS_ROUTES] Place Details error:', error);
        return res.status(500).json({
            status: 'error',
            message: error.message || 'Internal server error'
        });
    }
});
