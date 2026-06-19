import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./components/layouts/Layout.tsx",[
        index("./routes/Home.tsx"),
        route("shop", "./routes/Shop.tsx", [
            index("./components/layouts/DataGrid.tsx"),
            route(":item","./components/bits/Details.tsx"),
        ]),
        layout("./components/layouts/Admin.tsx",[
            route("admin", "./routes/Console.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
