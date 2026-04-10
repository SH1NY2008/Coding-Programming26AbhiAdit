import { Client, Place, AddressType } from "@googlemaps/google-maps-services-js";
import type { Business } from "./data";
import axios from "axios";

const client = new Client({
  axiosInstance: axios.create({
    adapter: require('axios/lib/adapters/xhr')
  })
});

const API_KEY = process.env.PLACES_API || "";

function transformPlaceToBusiness(place: Partial<Place>): Business {
  const addressComponents = place.address_components || [];
  const getAddressComponent = (type: AddressType) => addressComponents.find(c => c.types.includes(type))?.long_name || '';

  return {
    id: place.place_id || '',
    name: place.name || 'No name available',
    description: place.vicinity || 'No description available.',
    category: place.types?.[0] || 'other',
    address: place.formatted_address || '',
    city: getAddressComponent(AddressType.locality),
    state: getAddressComponent(AddressType.administrative_area_level_1),
    zipCode: getAddressComponent(AddressType.postal_code),
    phone: place.formatted_phone_number || '',
    email: '', // Not provided by nearby search
    website: place.website || '',
    imageUrl: place.photos?.[0]?.photo_reference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${API_KEY}` : '',
    hours: {},
    priceLevel: place.price_level as 0 | 1 | 2 | 3 | 4 | undefined,
    averageRating: place.rating || 0,
    totalReviews: place.user_ratings_total || 0,
    isOpen: place.opening_hours?.open_now,
    latitude: place.geometry?.location.lat || 0,
    longitude: place.geometry?.location.lng || 0,
    tags: place.types || [],
    createdAt: new Date().toISOString(),
  };
}

export async function fetchNearbyPlaces(lat: number, lon: number, radius: number, type: string): Promise<Business[]> {
  try {
    const response = await client.placesNearby({
      params: {
        location: { lat, lng: lon },
        radius,
        type,
        key: API_KEY,
      },
      timeout: 5000, // milliseconds
    });

    if (response.data.status === 'OK') {
      const places = response.data.results;
      const businessPromises = places.map(async (place) => {
        const detailsResponse = await client.placeDetails({
            params: {
                place_id: place.place_id || '',
                fields: ["address_component", "formatted_phone_number", "website"],
                key: API_KEY,
            }
        });
        const placeDetails = detailsResponse.data.result;
        return transformPlaceToBusiness({...place, ...placeDetails});
      });

      return Promise.all(businessPromises);
    } else {
      console.error('Google Places API Error:', response.data.status);
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch from Google Places API:', error);
    return [];
  }
}
