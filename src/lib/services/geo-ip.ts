import axios from "axios";

export interface GeoLocation {
  lat: number;
  lng: number;
  country: string;
  city: string;
  region: string;
}

export async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      lat: response.data.latitude,
      lng: response.data.longitude,
      country: response.data.country_name,
      city: response.data.city,
      region: response.data.region,
    };
  } catch (error) {
    console.error("Error getting location from IP:", error);
    return {
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
    };
  }
}
