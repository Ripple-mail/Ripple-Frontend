export function load({ params }: any) {
    return {
        timestamp: params.timestamp,
        params: params
    }
}