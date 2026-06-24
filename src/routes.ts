import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./components/layouts/Layout.tsx",[
        index("./routes/Home.tsx"),
        layout("./components/layouts/Admin.tsx",[
            route("admin", "./routes/Console.tsx"),
        ]),
        route("events", "./routes/Events.tsx"),
    ]),
] satisfies RouteConfig;
