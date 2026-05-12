import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  useTheme,
} from "@mui/material";
import type {
  CatalogItem,
  CatalogVariation,
  Price,
} from "../workhorse/queries";
import { Link } from "react-router";

interface ProductCardProps {
  item: CatalogItem;
  inventory: Record<string, number>;
  outOfStockMode: "overlay" | "subtle";
}

export default function ProductCard({
  item,
  inventory,
  outOfStockMode,
}: ProductCardProps) {
  const theme = useTheme();
  // Check if this item is in stock or not.
  const isInStock = item.variations.some((v) => (inventory[v.id] ?? 0) > 0);
  // Price stuff
  const fixedPrices = item.variations
    .filter(
      (v): v is CatalogVariation & { price: Price } =>
        v.price !== "VARIABLE_PRICE",
    )
    .map((v) => v.price.amount);
  const displayPrice =
    fixedPrices.length === 0
      ? "Price Varies"
      : (() => {
          const minCents = Math.min(...fixedPrices);
          const dollarStr = `$${(minCents / 100).toFixed(2)}`;
          return fixedPrices.length > 1 ? `from ${dollarStr}` : dollarStr;
        })();
  const displayImage = item.images[0] ?? "/placeholder.png";

  return (
    <Link style={{ textDecoration: "none" }} to={`/shop/${item.name}`}>
      <Card
        elevation={4}
        sx={{
          maxWidth: { xs: 200, sm: 300 },
          height: { xs: 400, sm: 500 },
          position: "relative",
          borderRadius: "10px",
          m: 2,
        }}
      >
        {!isInStock && outOfStockMode === "overlay" && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              overflow: "hidden",
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <Typography variant="body1">Out of Stock</Typography>
          </Box>
        )}
        <CardMedia
          image={displayImage}
          component={"img"}
          sx={{
            maxHeight: { xs: 200, sm: 300 },
            objectFit: "contain",
            pt: 2,
          }}
        />
        <CardContent>
          <Typography variant="h6">{item.name}</Typography>
          <Box
            sx={{ position: "relative", height: "4em", overflowY: "hidden" }}
          >
            <Typography variant="body2" sx={{ p: 1 }}>
              {item.description}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "2em",
                background: `linear-gradient(transparent, ${theme.palette.background.paper})`,
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {item.categories.join(", ")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 1,
            }}
          >
            <Typography variant="subtitle1">{displayPrice}</Typography>
            {!isInStock && outOfStockMode === "subtle" && (
              <Typography variant="caption" color="error">
                Out of Stock
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
