export type User = {
    id: number;
    name: string;
    email: string;
    password: string;
}

export type Email = {
    filename: string;
    path: string;
    content: string;
    unread: boolean;
    attachments: string[];
}

export type FormattedEmail = {
    timestampRelative: string;
    timestampLocale: string;
    from: string;
    rcpt: string;
    subject: string;
    content: string;
    attachments: string[];
}