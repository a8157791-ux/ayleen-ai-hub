import SearchClient from './SearchClient'

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; page?: string }
}) {
  return (
    <SearchClient
      initialQ={searchParams.q ?? ''}
      initialType={searchParams.type ?? 'all'}
      initialPage={parseInt(searchParams.page ?? '1')}
    />
  )
}
