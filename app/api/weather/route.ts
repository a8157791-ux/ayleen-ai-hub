export const dynamic = 'force-dynamic'

export async function GET() {
  const res = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=Asia%2FSeoul'
  )
  const data = await res.json()
  return Response.json(data)
}