import MapView from "@/components/map-view"

export default function Home() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <style jsx global>{`
        html, body {
          height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
        }
      `}</style>
      <MapView />
    </main>
  )
}

