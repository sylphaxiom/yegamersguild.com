import type { Route } from "./+types/Events";
import {
  type Events,
  fetchEvents,
  queryClient,
} from "~/components/workhorse/queries";
import Header from "~/components/Header";
import EventsCalendar from "~/components/EventsCalendar";
import { useQuery } from "@tanstack/react-query";
import Thinking from "~/components/baubles/Thinking";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Welcome to Ye Gamer\'s Guild Game Shop!" },
  ];
}

export async function clientLoader() {
  // Grab catalog information
  queryClient.prefetchQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents(),
  });
  return;
}

export default function Events() {
  let events: Events[] = [];
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents(),
  });
  if (data?.status === "Failure") {
    console.log(
      "Events query failed, plese check the server logs for further details.",
    );
  } else if (data?.objects) {
    events = data.objects;
  }
  return (
    <>
      <Header />
      {isLoading ? <Thinking /> : <EventsCalendar events={events} />}
    </>
  );
}
