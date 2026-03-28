export class GoogleMapsService {
    private readonly apiKey: string;

    constructor() {
        this.apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ [GoogleMapsService] VITE_GOOGLE_MAPS_API_KEY not found in environment');
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

    async autocomplete(input: string) {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        // Adicionando restrição por país (Brasil) se necessário, ou mantendo genérico
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&language=pt-BR`;

        try {
            const response = await fetch(url);
            const data = await response.json() as any;
            return data;
        } catch (error) {
            console.error('Error calling Google Maps Autocomplete API:', error);
            throw new Error('Failed to fetch from Google Maps API');
        }
    }

    async getPlaceDetails(placeId: string, fields: string = 'address_components,formatted_address') {
        if (!this.apiKey) {
            throw new Error('Google Maps API key not configured');
        }

        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${this.apiKey}&language=pt-BR`;

        try {
            const response = await fetch(url);
            const data = await response.json() as any;
            return data;
        } catch (error) {
            console.error('Error calling Google Maps Place Details API:', error);
            throw new Error('Failed to fetch from Google Maps API');
        }
    }
}
