export interface Email {
	id: number;
	subject: string | null;
	body_text: string | null;
	from_address: string | null;
}
