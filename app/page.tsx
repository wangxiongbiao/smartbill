import LandingPage from "../components/LandingPage";

export default async function Home({ searchParams }: { searchParams: Promise<{ next?: string; auth_error?: string }> }) {
    const params = await searchParams;
    return <LandingPage initialNext={params.next} authError={params.auth_error === 'true'} />;
}
