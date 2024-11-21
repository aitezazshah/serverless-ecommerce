import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";

interface EditProductDialogProps {
  open: boolean;
  handleClose: () => void;
  product: any; // Replace with a more specific type if possible
  token: string;
  getProductDetails: () => Promise<void>;
}

export const EditProductDialog: React.FC<EditProductDialogProps> = ({
  open,
  handleClose,
  product,
  token,
  getProductDetails,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title || "");
      setDescription(product.description || "");
      setPrice(product.price ? product.price.toString() : "");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare JSON payload
      const payload = {
        productId: product.productId,
        title: title,
        description: description,
        price: parseFloat(price),
      };

      // Send update request
      const response = await fetch(
        "https://srchkmvzl4.execute-api.us-east-1.amazonaws.com/test/update-product",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await getProductDetails();

        handleClose();
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Product Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <TextField
              label="Price"
              variant="outlined"
              type="number"
              fullWidth
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Update Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
