import { Stack, Card, Button, useTheme, Typography, Fab } from "@mui/material";
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
  const [feedbackState, setFeedbackState] = useState<any>({
    open: false,
  });
  const [wantToSell, setWantTOSell] = useState<boolean>(false);
  const [products, setProducts] = useState<any>(null);
  const [isUpdatePassword, setIsUpdatePassword] = useState<boolean>(false);

  useEffect(() => {
    if (!token || !userRole) {
      navigation("/");
    }
  }, [token, userRole]);

  const getProductDetails = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8080/v1/auth/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      if (response.status) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const handleBuyProduct = useCallback(
    async (e: any, id: string) => {
      e.preventDefault();
      try {
        await fetch(`http://localhost:8080/v1/auth/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            productId: id,
          }),
        });
        getProductDetails();
      } catch (error) {
        console.log(error);
      }
    },
    [getProductDetails]
  );

  useEffect(() => {
    getProductDetails();
  }, [getProductDetails]);

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
          setFeedbackState({
            open: false,
          });
        }}
      />
      <SellingDialog
        open={wantToSell}
        handleClose={() => setWantTOSell(false)}
        getProductDetails={getProductDetails}
      />

      <Stack
        sx={{
          width: "100%",
        }}
      >
        <Card
          elevation={2}
          sx={{
            padding: theme.spacing(2, 1),
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1}>
              <Typography variant="h4">Products List</Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={() => {
                  setIsUpdatePassword(true);
                }}
                sx={{
                  textTransform: "none",
                }}
              >
                Update Password
              </Button>
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
                  localStorage.setItem("userRole", "");
                  navigation("/");
                }}
              >
                Logout
              </Button>
              <Button
                variant="contained"
                onClick={() =>
                  setFeedbackState({
                    open: true,
                  })
                }
              >
                Feedback
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Stack spacing={2} mt={4} minHeight={580}>
          {products?.length ? (
            products?.map(({ id, name, description, price, isBought }: any) => (
              <Card elevation={4} key={id}>
                <Stack spacing={1} p={2}>
                  <Typography>Title: {name}</Typography>
                  <Stack direction={"row"} spacing={2}>
                    <Typography>Description: {description}</Typography>
                    <Typography>Price: {`${price ?? 0}`}</Typography>
                  </Stack>
                  {userRole === "buyer" && (
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {!isBought && (
                        <Button
                          variant="contained"
                          onClick={(e) => handleBuyProduct(e, id)}
                        >
                          Buy
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))
          ) : (
            <Typography>No Data Found</Typography>
          )}
        </Stack>
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
