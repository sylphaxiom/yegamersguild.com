import { useMutation } from "@tanstack/react-query";
import { postEvent, queryClient, type EventData } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import * as React from "react";
import EventsField from "./EventsField";

export interface EventsCreateProps {
  onDone: () => void;
}

export default function EventsCreate({ onDone }: EventsCreateProps) {
  const { getAccessTokenSilently } = useAuth0();
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: EventData) => {
      const token = await getAccessTokenSilently();
      return postEvent(value, token);
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
    mutate(data);
  };
  return (
    <EventsField
      onSubmit={handleSubmit}
      onCancel={onDone}
      isPending={isPending}
    />
  );
}
