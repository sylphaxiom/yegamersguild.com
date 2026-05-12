import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout("./components/layouts/Layout.tsx",[
        index("./routes/Home.tsx"),
        route("shop", "./routes/Shop.tsx", [
            index("./components/bits/DataGrid.tsx"),
            route(":item","./components/bits/Details.tsx"),
        ]),
    ])
] satisfies RouteConfig;
