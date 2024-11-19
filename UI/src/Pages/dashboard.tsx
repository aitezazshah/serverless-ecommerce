import {
  Stack,
  Card,
  Button,
  useTheme,
  Typography,
  Fab,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { FeedbackDialog } from "../component/feedbackdialog";
import { SellingDialog, UpdatePasswordDialog } from "../component";

export const Dashboard = () => {
  const theme = useTheme();
  const token = localStorage.getItem(
    "CognitoIdentityServiceProvider.10fqms5r41oqvidv1jp0r2gkpt.44e894a8-6081-70dd-9e9a-21483e83295f.accessToken"
  );
  const userRole = localStorage.getItem("userRole");
  const navigation = useNavigate();
  const [feedbackState, setFeedbackState] = useState<any>({ open: false });
  const [wantToSell, setWantTOSell] = useState<boolean>(false);
  const [products, setProducts] = useState<any>(null);
  const [isUpdatePassword, setIsUpdatePassword] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("default");
  console.log("Fetched products:", products);

  useEffect(() => {
    if (!userRole) {
      navigation("/");
    }
  }, [userRole]);

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/search-product?q=${searchTerm}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleSort = async () => {
    try {
      const response = await fetch(
        `https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/sort-product?q=${sortOrder}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const getProductDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/create-product`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      if (response.status) {
        const data = await response.json();
        setProducts(data);
        console.log("Product Data", data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleBuyProduct = useCallback(
    async (e: any, id: string) => {
      console.log("Product ID:", id);
      e.preventDefault();
      try {
        const response = await fetch(
          `https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/purchase`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              productId: id,
              userId: localStorage.getItem("userId"), // Add this to your login flow
            }),
          }
        );
        console.log(response);

        if (response.ok) {
          const data = await response.json();
          console.log("Purchase successful:", data);
          // Show success message to user
          getProductDetails(); // Refresh product list
        } else {
          throw new Error("Purchase failed");
        }
      } catch (error) {
        console.error(error);
        // Show error message to user
      }
    },
    [getProductDetails, token]
  );

  useEffect(() => {
    getProductDetails();
  }, [getProductDetails]);
  const capitalizeWords = (str: string): string =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  return (
    <>
      <UpdatePasswordDialog
        open={isUpdatePassword}
        handleClose={() => {
          setIsUpdatePassword(false);
        }}
      />
      <FeedbackDialog
        open={feedbackState.open}
        handleClose={() => {
          setFeedbackState({ open: false });
        }}
      />
      <SellingDialog
        open={wantToSell}
        handleClose={() => setWantTOSell(false)}
        getProductDetails={getProductDetails}
      />

      <Stack sx={{ width: "100%" }}>
        <Card elevation={2} sx={{ padding: theme.spacing(2, 1) }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <Typography variant="h4">Products List</Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              {/* <Button
                variant="contained"
                onClick={() => {
                  setIsUpdatePassword(true);
                }}
                sx={{
                  textTransform: "none",
                }}
              >
                Update Password
              </Button> */}
              <Button
                variant="contained"
                color="secondary"
                sx={{
                  textTransform: "none",
                }}
                onClick={() => {
                  localStorage.setItem(
                    "CognitoIdentityServiceProvider.10fqms5r41oqvidv1jp0r2gkpt.44e894a8-6081-70dd-9e9a-21483e83295f.accessToken",
                    ""
                  );
                  localStorage.setItem(
                    "CognitoIdentityServiceProvider.10fqms5r41oqvidv1jp0r2gkpt.b48874d8-d0d1-70dd-2dfd-7573775d5286.signInDetails",
                    ""
                  );

                  localStorage.setItem("userRole", "");
                  navigation("/");
                }}
              >
                Logout
              </Button>
              {/* <Button
                variant="contained"
                onClick={() =>
                  setFeedbackState({
                    open: true,
                  })
                }
              >
                Feedback
              </Button> */}
            </Stack>
          </Stack>
        </Card>

        {/* Grid Layout for Product Cards */}
        <Stack direction="row" spacing={1} padding={2}>
          <TextField
            variant="outlined"
            label="Search Products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>

          <FormControl variant="outlined" sx={{ minWidth: 120 }}>
            <InputLabel>Sort Price</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                handleSort();
              }}
              label="Sort Price"
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="high-to-low">Low to High</MenuItem>
              <MenuItem value="low-to-high">High to Low</MenuItem>
            </Select>
          </FormControl>
        </Stack>
        <Grid container spacing={3} mt={4}>
          {products?.length ? (
            products?.map(
              ({
                productId,
                title,
                imageUrl,
                description,
                price,
                isBought,
              }: any) => (
                <Grid item xs={12} sm={6} md={3} key={productId}>
                  <Card
                    elevation={4}
                    sx={{
                      maxWidth: 345,
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: theme.shadows[3],
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <Stack spacing={2} p={2}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {capitalizeWords(title)}
                      </Typography>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          Description:
                        </Typography>
                        <Typography variant="body2" noWrap>
                          {description}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary"
                        >
                          {`$${price ?? 0}`}
                        </Typography>
                      </Stack>

                      {userRole === "buyer" && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          {!isBought ? (
                            <Button
                              variant="contained"
                              onClick={(e) => handleBuyProduct(e, productId)}
                              sx={{
                                textTransform: "none",
                                backgroundColor: "#00ff99",
                                "&:hover": { backgroundColor: "#00e187" },
                              }}
                            >
                              Buy Now
                            </Button>
                          ) : (
                            <Typography variant="body2" color="#00e187">
                              SOLD OUT
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              )
            )
          ) : (
            <Typography paddingLeft={10}>No Data Found</Typography>
          )}
        </Grid>
      </Stack>

      {userRole === "seller" && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{
            position: "sticky",
            bottom: 40,
            padding: 1,
          }}
          onClick={() => setWantTOSell(true)}
        >
          <Fab variant="extended">Sell</Fab>
        </Stack>
      )}
    </>
  );
};
