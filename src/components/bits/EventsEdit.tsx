import {
  putEvent,
  queryClient,
  type EventData,
  type Events,
} from "../workhorse/queries";
import EventsField from "./EventsField";
import { useMutation } from "@tanstack/react-query";
import { useAuth0 } from "@auth0/auth0-react";

export interface EventsEditProps {
  event: Events;
  onDone: () => void;
}

export default function EventsEdit({ event, onDone }: EventsEditProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: Events) => {
      const token = await getAccessTokenSilently();
      return putEvent(value, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onDone();
    },
  });
  const handleSubmit = (
    e: React.SubmitEvent<HTMLFormElement>,
    data: EventData,
  ) => {
    e.preventDefault();
    mutate({
      ...data,
      id: event.id,
      created_at: event.created_at,
      updated_at: event.updated_at,
    });
  };
  return (
    <EventsField
      initialValues={event}
      onSubmit={handleSubmit}
      onCancel={onDone}
      isPending={isPending}
      imageKey={"evnt_" + event.id}
    />
  );
}
