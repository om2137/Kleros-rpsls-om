import Player2 from '@/components/Player2'

export default async function page({ params }: { params: Promise<{ id: string }> }) {
    const gameid = await params;
    console.log(gameid.id)
    return (
        <>
            <Player2 gameAddress={gameid.id} />
        </>
    )
}
