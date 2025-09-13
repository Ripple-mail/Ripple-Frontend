export interface UserEmail {
	id: string;
	userid: string;
	emailid: string;
	mailboxid: string;
	isSender: boolean;
	isRead: boolean;
	isStarred: boolean;
	createdAt: string;
	trashSince: string | null;
	updatedAt: string;
	deletedAt: string | null;
	email: Email;
}

export interface Email {
	id: string;
	senderid: string;
	fromAddress: string;
	messageid: string;
	subject: string;
	date: string;
	bodyText: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	searchVector: string | null;
	recipients: Recipient;
}

export interface Recipient {
	id: string;
	emailid: string;
	userid: string;
	address: string;
	type: 'to' | 'cc' | 'bcc';
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
