export interface Calendar {
	id: string;
	userId: string;
	name: string;
	color: string;
	isVisible: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateCalendarRequest {
	name: string;
	color: string;
}

export interface UpdateCalendarRequest {
	name?: string;
	color?: string;
	isVisible?: boolean;
}

export type UpdateCalendarInput = { id: string } & UpdateCalendarRequest;
