export interface Email {
	id: number;
	subject: string | null;
	body_text: string | null;
	fromAddress: string | null;
	createdAt: string;
	isRead: boolean;
	isStarred: boolean | null;
	isSender?: boolean;
	recipients?: { address: string | null }[];
}

export interface Mailbox {
	id: number;
	userId: number;
	name: string;
	mailboxType: 'inbox' | 'sent' | 'draft' | 'trash' | null;
	systemMailbox: boolean;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}
