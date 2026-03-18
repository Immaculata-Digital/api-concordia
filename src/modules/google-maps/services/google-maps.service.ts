export class GoogleMapsService {
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ [GoogleMapsService] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found in environment');
        }
    }

    async geocode(address: string) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json() as any;
            return data;
        } catch (error) {
            console.error('Error calling Google Maps Geocode API:', error);
            throw new Error('Failed to fetch from Google Maps API');
        }
    }

    async reverseGeocode(latlng: string) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(latlng)}&key=${this.apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json() as any;
            return data;
        } catch (error) {
            console.error('Error calling Google Maps Reverse Geocode API:', error);
            throw new Error('Failed to fetch from Google Maps API');
        }
    }
}
