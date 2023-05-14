import { ulid } from "ulid";

export type User = {
	id: string;
	name: string;
};

type CreateUserProps = {
	name: string;
};

export function createUser(props: CreateUserProps): User {
	return {
		id: ulid(),
		name: props.name,
	};
}
