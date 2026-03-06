export interface Location {
  id?: number;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  radius: number;
  geofenceData?: string;
  createdAt: number;
}
