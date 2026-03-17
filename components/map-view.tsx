
"use client"

import { BusinessWithDistance } from "@/lib/data"
import {
    Map,
    MapMarker,
    MapPopup,
    MapTileLayer,
} from "@/components/ui/map"
import Link from "next/link"

interface MapViewProps {
    businesses: BusinessWithDistance[]
    latitude: number
    longitude: number
}

export function MapView({ businesses, latitude, longitude }: MapViewProps) {
    return (
        <div className="h-[600px] w-full rounded-md overflow-hidden">
            <Map center={[latitude, longitude]} zoom={13}>
                <MapTileLayer
                    name="Geoapify"
                    url='https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?&apiKey=4a02232b7ec44556b221b6e1f63a0ca3'
                    attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>'
                />
                {businesses.map((business) => (
                    <MapMarker key={business.id} position={[business.latitude, business.longitude]}>
                        <MapPopup>
                            <div className="p-1">
                                <h3 className="font-bold">
                                    <Link href={`/business?id=${business.id}`} className="hover:underline">
                                        {business.name}
                                    </Link>
                                </h3>
                                <p className="text-sm text-gray-500">{business.subcategory}</p>
                            </div>
                        </MapPopup>
                    </MapMarker>
                ))}
            </Map>
        </div>
    )
}
