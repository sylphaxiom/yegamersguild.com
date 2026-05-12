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
    <Link style={{ textDecoration: "none" }} to={`/shop/${item.id}`}>
      <Card
        elevation={4}
        sx={{
          width: { xs: 200, sm: 300 },
          height: "auto",
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
            height: { xs: 200, sm: 300 },
            objectFit: "contain",
            pt: 2,
          }}
        />
        <CardContent>
          <Box sx={{ height: "3em", overflow: "hidden" }}>
            <Typography
              variant="h6"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.name}
            </Typography>
          </Box>

          <Box
            sx={{ position: "relative", height: "4em", overflowY: "hidden" }}
          >
            <Typography
              variant="body2"
              sx={{
                p: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </Typography>
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
