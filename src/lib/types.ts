export interface Recipient {
	id: string;
	address: string | null;
	type: 'to' | 'cc' | 'bcc';
}

export interface Email {
	id: string;
	subject: string | null;
	bodyText: string | null;
	fromAddress: string | null;
	createdAt: string;
	isRead: boolean;
	isStarred: boolean | null;
	isSender?: boolean;
	recipients: Recipient[];
}

export interface UserEmail {
	id: string;
	isRead: boolean;
	isSender: boolean;
	email: Email;
}


export interface Mailbox {
	id: string;
	userId: string;
	name: string;
	mailboxType: 'inbox' | 'sent' | 'draft' | 'trash' | null;
	systemMailbox: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
