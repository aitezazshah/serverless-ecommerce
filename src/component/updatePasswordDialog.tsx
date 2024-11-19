import { yupResolver } from "@hookform/resolvers/yup/src/yup.js";
import {
  Button,
  Dialog,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

const schema = Yup.object().shape({
  password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const UpdatePasswordDialog = ({ open, handleClose }: any) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const token = localStorage.getItem("token");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<any>({
    defaultValues: {
      password: "",
    },
    mode: "all",
    resolver: yupResolver(schema),
  });

  const handleChangePassword = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/v1/auth/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            password: watch("password"),
          }),
        }
      );
      if (response.status === 200) {
        handleClose();
        setErrorMessage("")
      }else{
        setErrorMessage("Something went wrong");
      }
    } catch (error) {
      console.log(error);
    }
  }, [handleClose, token, watch]);

  return (
    <Dialog open={open} onClose={()=>{handleClose()
      reset()
      setErrorMessage("")
    }} maxWidth={"sm"} fullWidth>
      <DialogTitle>Update Password</DialogTitle>
      <Stack
        component={"form"}
        spacing={2}
        onSubmit={handleSubmit(handleChangePassword)}
        p={2}
      >
        <TextField
          fullWidth
          label="Update Password"
          value={watch("password")}
          {...register("password")}
          helperText={errors && (errors.password?.message as string)}
          sx={{ "& .MuiFormHelperText-root": { color: "red" } }}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Stack>
    </Dialog>
  );
};
