"use client";

import { useState } from "react";

export default function Places() {
    const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<any | null>(null);

    const fetchData = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = "4a02232b7ec44556b221b6e1f63a0ca3";
          const radius = 5000; // 5km radius
          const url = `https://api.geoapify.com/v2/places?categories=commercial.supermarket&filter=circle:${longitude},${latitude},${radius}&bias=proximity:${longitude},${latitude}&limit=20&apiKey=${apiKey}`;

          fetch(url)
            .then((response) => response.json())
            .then((result) => {
              setData(result);
            })
            .catch((error) => {
              setError(error);
            });
        },
        (error) => {
          setError(error);
        }
      );
    } else {
      setError(new Error("Geolocation is not supported by this browser."));
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div>
          <button onClick={fetchData} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Fetch Places
          </button>
          {error && <pre>Error: {JSON.stringify(error, null, 2)}</pre>}
          {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
      </div>
    </main>
  );
}
