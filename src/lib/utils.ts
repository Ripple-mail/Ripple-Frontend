export function convertTimeToRelative(timestamp: string) {
    const time = parseInt(timestamp);
    const date = new Date(time);

    const now = Date.now();
    const diff = now - date.getTime();

    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    if (diff < msPerMinute) return `${Math.round(diff / 1000)} seconds ago`;
    else if (diff < msPerHour) return `${Math.round(diff / msPerMinute)} minutes ago`;
    else if (diff < msPerDay) return `${Math.round(diff / msPerHour)} hours ago`;
    else if (diff < msPerMonth) return `${Math.round(diff / msPerDay)} days ago`;
    else if (diff < msPerYear) return `${Math.round(diff / msPerMonth)} months ago`;
    else return `${Math.round(diff / msPerYear)} years ago`;
}

export function convertTimeToLocale(timestamp: string) {
    const time = parseInt(timestamp);

    const date = new Date(time);
    return date.toLocaleString();
}

export function getInitials(name: string) { //@ts-ignore
    let regex = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
    let initials = [...name.matchAll(regex)];
    //@ts-ignore
    initials = ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase();
    return initials;
}