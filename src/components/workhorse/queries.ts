import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

type ResponseStatus = 
        | 'Failure'
        | 'Success'

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        // In CI the external APIs may be unreachable. Skip retries so the loading
        // state exits immediately and tests fail with a clear "empty" error rather
        // than a misleading "element not found" timeout.
        // VITE_CI=true is set in the GitHub Actions workflow env block.
        retry: import.meta.env.VITE_CI ? 0 : 3,
      },
    },
  });

const api = axios.create({
    baseURL: "https://api.sylphaxiom.com",
    withCredentials:true
})

//////////////////////////////////////////////////
// These are for the content management system  //
//////////////////////////////////////////////////

// Content queries/types

export interface ContentResponse {
    status: string;
    message: string;
    objects?: TextContent[];
}

export interface TextContent {
    content_key: string;
    label: string;
    value: string;
    updated_at: number;
}

export interface StandardResponse {
    status: string;
    message: string;
}

export async function fetchContent(): Promise<ContentResponse> {
    const response = await api
    .get(`/content.php`, {
        headers:{
            Fish: import.meta.env.VITE_FISH,
        },
    })
    .catch((error)=>{
        console.log("An error occurred fetching the content: %s", error);
        throw error
    })
    return response.data;
}

export async function putContent(content_key: string, value: string, token: string): Promise<StandardResponse> {
    const response = await api
    .put(`/content.php`, { content_key, value }, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
        params: { content_key },
    })
    .catch((error) => {
        console.log("An error occurred updating content: %s", error);
        throw error
    })
    return response.data;
}

// Image queries/types

export interface ImagesResposne {
    status: string;
    message: string;
    objects?: Image[];
}

export interface Image {
    id: number;
    shortName: string;
    content_key: string;
    src: string;
    alt: string;
    display_order: number;
    width: number;
    height: number;
}

export interface ImageMetadata {
    alt: string;
    display_order: number;
}

export async function fetchImages(): Promise<ImagesResposne> {
    const response = await api
    .get(`/images.php`, {
        headers:{
            Fish: import.meta.env.VITE_FISH,
        },
    })
    .catch((error)=>{
        console.log("An error occurred fetching the images: %s", error);
        throw error
    })
    return response.data;
}

export async function postImage(content_key: string, formData: FormData, token: string): Promise<StandardResponse> {
    const response = await api
    .post(`/images.php`, formData, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        },
        params: { content_key },
    })
    .catch((error) => {
        console.log("An error occurred uploading an image: %s", error);
        throw error
    })
    return response.data;
}

export async function putImage(id: number, metadata: ImageMetadata, token: string): Promise<StandardResponse> {
    const response = await api
    .put(`/images.php`, { id, ...metadata }, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
    })
    .catch((error) => {
        console.log("An error occurred updating image metadata: %s", error);
        throw error
    })
    return response.data;
}

export async function deleteImage(id: number, token: string): Promise<StandardResponse> {
    const response = await api
    .delete(`/images.php`, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
        data: { id },
    })
    .catch((error) => {
        console.log("An error occurred deleting an image: %s", error);
        throw error
    })
    return response.data;
}

// Event queries/types

export interface EventsResponse {
    status:string;
    message:string;
    objects?:Events[]
}

export interface Events {
    id:number;
    title:string;
    description?:string;
    start_datetime:string;
    end_datetime?:string;
    all_day:number;
    created_at:string;
    updated_at:string;
}

export interface EventData {
    title:string;
    description?:string;
    start_datetime:string;
    end_datetime?:string;
    all_day:number;
}

export async function fetchEvents(): Promise<EventsResponse> {
    const response = await api
    .get(`/events.php`, {
        headers:{
            Fish: import.meta.env.VITE_FISH,
        },
    })
    .catch((error)=>{
        console.log("An error occurred fetching the events: %s", error);
        throw error
    })
    return response.data;
}

export async function postEvent(eventData: EventData, token: string): Promise<StandardResponse> {
    const response = await api
    .post(`/events.php`, eventData, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
    })
    .catch((error) => {
        console.log("An error occurred uploading an event: %s", error);
        throw error
    })
    return response.data;
}

export async function putEvent(eventData: Events, token: string): Promise<StandardResponse> {
    const response = await api
    .put(`/events.php`, eventData, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
    })
    .catch((error) => {
        console.log("An error occurred updating Event metadata: %s", error);
        throw error
    })
    return response.data;
}

export async function deleteEvent(id: number, token: string): Promise<StandardResponse> {
    const response = await api
    .delete(`/events.php`, {
        headers: {
            Fish: import.meta.env.VITE_FISH,
            Authorization: `Bearer ${token}`,
        },
        data: { id },
    })
    .catch((error) => {
        console.log("An error occurred deleting an Event: %s", error);
        throw error
    })
    return response.data;
}