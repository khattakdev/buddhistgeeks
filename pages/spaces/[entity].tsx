import { useRouter } from "next/router";

export default function SpacesPage() {
  let router = useRouter()

  return <div>
    <h1>{router.query.entity}</h1>
  </div>
}
