import { yupResolver } from "@hookform/resolvers/yup/src/yup.js";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

const schema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  price: Yup.string().required("Price is required"),
  image: Yup.mixed().required("Image is required"),
});

export const SellingDialog = ({
  open,
  handleClose,
  getProductDetails,
}: any) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const token = localStorage.getItem(
    "CognitoIdentityServiceProvider.10fqms5r41oqvidv1jp0r2gkpt.44e894a8-6081-70dd-9e9a-21483e83295f.accessToken"
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<any>({
    defaultValues: {
      title: "",
      description: "",
      price: "",
      image: null,
    },
    mode: "all",
    resolver: yupResolver(schema),
  });

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const onSubmit = async (data: any) => {
    try {
      if (!imageBase64) {
        setErrorMessage("Please upload an image");
        return;
      }

      const response = await fetch(
        `https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/create-product`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            title: watch("title"),
            description: watch("description"),
            price: Number(watch("price")),
            base64Image: imageBase64,
          }),
        }
      );

      if (response) {
        reset();
        setImageBase64(null);
        handleClose();
        getProductDetails();
        setSuccessMessage("Product Created Successfully");
        setSuccessMessage("");
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An error occurred while submitting the form");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose();
        reset();
        setImageBase64(null);
        setErrorMessage("");
        setSuccessMessage("");
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle textAlign="center">Selling Form</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2}
          mt={2}
          width="100%"
        >
          <TextField
            fullWidth
            label="Product Title"
            value={watch("title")}
            {...register("title")}
            helperText={errors && (errors.title?.message as string)}
            sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
          />
          <TextField
            fullWidth
            label="Product Description"
            value={watch("description")}
            {...register("description")}
            helperText={errors && (errors.description?.message as string)}
            sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
          />
          <TextField
            fullWidth
            label="Price"
            value={watch("price")}
            {...register("price")}
            helperText={errors && (errors.price?.message as string)}
            sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
          />
          <Button variant="contained" component="label">
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
          {imageBase64 && (
            <Typography color="primary" variant="caption">
              Image uploaded successfully
            </Typography>
          )}
          {errorMessage && (
            <Typography color="error">{errorMessage}</Typography>
          )}
          {successMessage && (
            <Typography color="green">{successMessage}</Typography>
          )}
          <Button variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
